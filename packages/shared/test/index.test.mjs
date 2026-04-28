import assert from "node:assert/strict";
import {
  CANCELABLE_RESERVATION_STATUSES,
  PROPERTY_TIME_ZONE,
  isReservationCancelableStatus,
  toPropertyIsoDateOnly,
} from "../dist/index.js";

function test(name, run) {
  run();
  console.log(`ok - ${name}`);
}

test("formats the current date in the property time zone", () => {
  assert.equal(PROPERTY_TIME_ZONE, "America/Sao_Paulo");
  assert.equal(toPropertyIsoDateOnly(new Date("2026-04-29T01:30:00.000Z")), "2026-04-28");
  assert.equal(toPropertyIsoDateOnly(new Date("2026-04-29T03:00:00.000Z")), "2026-04-29");
});

test("marks only pre-arrival reservation statuses as cancelable", () => {
  assert.deepEqual(CANCELABLE_RESERVATION_STATUSES, ["PENDING", "CONFIRMED"]);
  assert.equal(isReservationCancelableStatus("PENDING"), true);
  assert.equal(isReservationCancelableStatus("CONFIRMED"), true);
  assert.equal(isReservationCancelableStatus("CANCELLED"), false);
  assert.equal(isReservationCancelableStatus("CHECKED_IN"), false);
  assert.equal(isReservationCancelableStatus("CHECKED_OUT"), false);
  assert.equal(isReservationCancelableStatus("NO_SHOW"), false);
  assert.equal(isReservationCancelableStatus("UNKNOWN"), false);
});
