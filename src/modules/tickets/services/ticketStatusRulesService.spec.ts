import { TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { canTransitionTicketStatus, ensureValidTicketTransition } from "./ticketStatusRulesService";

describe("ticketStatusRulesService", () => {
  describe("canTransitionTicketStatus", () => {
    it("should allow valid transitions", () => {
      expect(canTransitionTicketStatus(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)).toBe(true);
      expect(canTransitionTicketStatus(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)).toBe(true);
      expect(canTransitionTicketStatus(TicketStatus.WAITING_CUSTOMER, TicketStatus.CLOSED)).toBe(
        true,
      );
      expect(canTransitionTicketStatus(TicketStatus.RESOLVED, TicketStatus.CLOSED)).toBe(true);
    });

    it("should reject invalid transitions", () => {
      expect(canTransitionTicketStatus(TicketStatus.CLOSED, TicketStatus.OPEN)).toBe(false);
      expect(canTransitionTicketStatus(TicketStatus.RESOLVED, TicketStatus.OPEN)).toBe(false);
      expect(canTransitionTicketStatus(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS)).toBe(false);
    });
  });

  describe("ensureValidTicketTransition", () => {
    it("should not throw for a valid transition", () => {
      expect(() =>
        ensureValidTicketTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
      ).not.toThrow();
    });

    it("should throw AppError for an invalid transition", () => {
      expect(() => ensureValidTicketTransition(TicketStatus.CLOSED, TicketStatus.OPEN)).toThrow(
        AppError,
      );

      expect(() => ensureValidTicketTransition(TicketStatus.CLOSED, TicketStatus.OPEN)).toThrow(
        "Transition invalid from CLOSED to OPEN",
      );
    });
  });
});
