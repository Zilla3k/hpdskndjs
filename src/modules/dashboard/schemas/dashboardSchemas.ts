import { z } from "zod";

export const dashboardPeriodQuerySchema = z
  .object({
    startDate: z.coerce.date({ message: "Start date must be a valid date" }),
    endDate: z.coerce.date({ message: "End date must be a valid date" }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before or equal to end date",
  });
