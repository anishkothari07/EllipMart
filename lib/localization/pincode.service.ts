import { prisma } from "../prisma/client";

export class PincodeService {
  /**
   * Look up city, district, state, and serviceability for a given pincode.
   */
  static async lookup(code: string) {
    const pin = await prisma.pincode.findUnique({
      where: { code },
      include: {
        city: {
          include: {
            district: {
              include: {
                state: true,
              },
            },
          },
        },
      },
    });

    if (!pin) {
      return {
        isServiced: false,
        isCOD: false,
        isExpress: false,
        city: "",
        district: "",
        state: "",
        estDaysMin: 3,
        estDaysMax: 7,
        shippingCharge: 99,
      };
    }

    return {
      isServiced: pin.isServiced,
      isCOD: pin.isCOD,
      isExpress: pin.isExpress,
      city: pin.city?.name || "",
      district: pin.city?.district?.name || "",
      state: pin.city?.district?.state?.name || "",
      estDaysMin: pin.estDaysMin,
      estDaysMax: pin.estDaysMax,
      shippingCharge: Number(pin.shippingCharge),
    };
  }

  /**
   * Computes delivery promise date details, skipping holidays and non-working days.
   */
  static async getDeliveryPromise(destPincode: string) {
    const pinDetails = await this.lookup(destPincode);
    if (!pinDetails.isServiced) {
      return null;
    }

    const today = new Date();
    const currentHour = today.getHours();
    
    // Default transit offset based on PIN details
    let transitDays = pinDetails.isExpress ? pinDetails.estDaysMin : pinDetails.estDaysMax;
    
    // Standard cutoff: 2 PM (14:00)
    const cutoffHour = 14;
    if (currentHour >= cutoffHour) {
      transitDays += 1; // Order placed after cutoff pushes processing by 1 day
    }

    // Resolve holidays
    const holidays = await prisma.holidayCalendar.findMany({
      where: {
        date: {
          gte: today,
          lte: new Date(today.getTime() + 15 * 864e5), // Check up to 15 days ahead
        },
      },
    });
    const holidayTimes = holidays.map(h => {
      const d = new Date(h.date);
      d.setHours(0,0,0,0);
      return d.getTime();
    });

    let targetDate = new Date(today);
    let transitCounter = 0;

    // Iterate day-by-day to find target delivery date
    while (transitCounter < transitDays) {
      targetDate.setDate(targetDate.getDate() + 1);
      
      const dayOfWeek = targetDate.getDay();
      const isSunday = dayOfWeek === 0;
      
      const compDate = new Date(targetDate);
      compDate.setHours(0,0,0,0);
      const isHoliday = holidayTimes.includes(compDate.getTime());

      // Deliveries only proceed on active working days (excluding Sundays and holidays)
      if (!isSunday && !isHoliday) {
        transitCounter++;
      }
    }

    const formatter = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    // Check if tomorrow delivery promise can be met
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = targetDate.toDateString() === tomorrow.toDateString();

    return {
      dateString: formatter.format(targetDate),
      isTomorrow,
      shippingCharge: pinDetails.shippingCharge,
      isCOD: pinDetails.isCOD,
      isExpress: pinDetails.isExpress,
    };
  }
}
