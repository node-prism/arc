import { testSuite, expect } from "manten";
import { nrml, testCollection2, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("join", ({ test }) => {
    test("works", () => {
      const users = testCollection();
      const tickets = testCollection2({ integerIds: true });

      users.insert({ name: "Jonathan", tickets: [3, 4] });
      tickets.insert({ title: "Ticket 0", description: "Ticket 0 description" });
      tickets.insert({ title: "Ticket 1", description: "Ticket 1 description" });
      tickets.insert({ title: "Ticket 2", description: "Ticket 2 description" });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: {
          collection: tickets,
          from: "tickets",
          to: "_id",
          as: "userTickets",
        },
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } });

      expect(res).toHaveProperty("userTickets");
      expect((res as any).userTickets).toEqual(tks);
    });

    test("respects query options", () => {
      const users = testCollection();
      const tickets = testCollection2({ integerIds: true });

      users.insert({ name: "Jonathan", tickets: [3, 4] });
      tickets.insert({ title: "Ticket 0", description: "Ticket 0 description" });
      tickets.insert({ title: "Ticket 1", description: "Ticket 1 description" });
      tickets.insert({ title: "Ticket 2", description: "Ticket 2 description" });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: {
          collection: tickets,
          from: "tickets",
          to: "_id",
          as: "userTickets",
          options: { project: { title: 1 } },
        },
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } }, { project: { title: 1 } });

      expect(res).toHaveProperty("userTickets");
      expect((res as any).userTickets).toEqual(tks);
    });
  });
});
