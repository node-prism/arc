import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("join", ({ test }) => {
    test("works", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets", integerIds: true });

      users.insert({ name: "Jonathan", tickets: [3, 4] });
      tickets.insert({ title: "Ticket 0", description: "Ticket 0 description" });
      tickets.insert({ title: "Ticket 1", description: "Ticket 1 description" });
      tickets.insert({ title: "Ticket 2", description: "Ticket 2 description" });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: [{
          collection: tickets,
          from: "tickets",
          on: "_id",
          as: "userTickets",
        }],
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } });

      expect(res).toHaveProperty("userTickets");
      expect((res as any).userTickets).toEqual(tks);
    });

    test("will overwrite original property", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets", integerIds: true });

      users.insert({ name: "Jonathan", tickets: [3, 4] });
      tickets.insert({ title: "Ticket 0", description: "Ticket 0 description" });
      tickets.insert({ title: "Ticket 1", description: "Ticket 1 description" });
      tickets.insert({ title: "Ticket 2", description: "Ticket 2 description" });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: [{
          collection: tickets,
          from: "tickets",
          on: "_id",
          as: "tickets",
        }],
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } });

      expect(res).toHaveProperty("tickets");
      expect((res as any).tickets).toEqual(tks);
    });

    test("creates the 'as' property even when nothing matches", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets" });

      users.insert({ name: "Jonathan", tickets: [] });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: [{
          collection: tickets,
          from: "tickets",
          on: "_id",
          as: "userTickets",
        }],
      }))[0];
      
      expect(res).toHaveProperty("userTickets");
      expect((res as any).userTickets).toEqual([]);
    });

    test("respects QueryOptions", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets", integerIds: true });

      users.insert({ name: "Jonathan", tickets: [3, 4] });
      tickets.insert({ title: "Ticket 0", description: "Ticket 0 description" });
      tickets.insert({ title: "Ticket 1", description: "Ticket 1 description" });
      tickets.insert({ title: "Ticket 2", description: "Ticket 2 description" });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: [{
          collection: tickets,
          from: "tickets",
          on: "_id",
          as: "userTickets",
          options: { project: { title: 1 } },
        }],
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } }, { project: { title: 1 } });

      expect(res).toHaveProperty("userTickets");
      expect((res as any).userTickets).toEqual(tks);
    });

    test("multiple joins", () => {
      const users = testCollection();
      const skills = testCollection({ name: "skills", integerIds: true });
      const items = testCollection({ name: "items", integerIds: true });

      users.insert({ name: "Jonathan", skills: [3, 4], items: [4, 5] });

      skills.insert({ title: "Skill 0" });
      skills.insert({ title: "Skill 1" });
      skills.insert({ title: "Skill 2" });

      items.insert({ title: "Item 0" });
      items.insert({ title: "Item 1" });
      items.insert({ title: "Item 2" });

      const res = nrml(
        users.find(
          { name: "Jonathan" },
          {
            join: [
              {
                collection: skills,
                from: "skills",
                on: "_id",
                as: "userSkills",
              },
              {
                collection: items,
                from: "items",
                on: "_id",
                as: "userItems",
              },
            ],
          }
        )
      )[0];

      const sks = skills.find({ _id: { $oneOf: [3, 4] } });
      const its = items.find({ _id: { $oneOf: [4, 5] } });

      expect(res).toEqual({
        name: "Jonathan",
        skills: [3, 4],
        items: [4, 5],
        userSkills: [...sks],
        userItems: [...its],
      });
    });

    test("nested joins", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets", integerIds: true });
      const seats = testCollection({ name: "seats", integerIds: true });

      users.insert({ name: "Jonathan", tickets: [3, 4] });
      tickets.insert({ title: "Ticket 0", seat: 3 });
      tickets.insert({ title: "Ticket 1", seat: 5 });
      tickets.insert({ title: "Ticket 2" });
      seats.insert({ seat: "S3" });
      seats.insert({ seat: "S4" });
      seats.insert({ seat: "S5" });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: [{
          collection: tickets,
          from: "tickets",
          on: "_id",
          as: "userTickets",
          options: {
            join: [{
              collection: seats,
              from: "seat",
              on: "_id",
              as: "userSeats",
            }]
          },
        }],
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } });
      const sts = seats.find({ _id: { $oneOf: [3, 5] } });

      expect(res).toHaveProperty("userTickets");
      res["userTickets"].forEach((t: any) => {
        expect(t).toHaveProperty("userSeats");
      });
      expect((res as any).userTickets[0]).toEqual({ ...tks[0] as object, userSeats: [sts[0]] });
      expect((res as any).userTickets[1]).toEqual({ ...tks[1] as object, userSeats: [sts[1]] });
    });

    test("with from dot notation, accessing array of objects", () => {
      const inventory = testCollection();
      const items = testCollection({ name: "items", integerIds: true });

      inventory.insert({
        name: "Jonathan",
        items: [
          { id: 3, quantity: 1 },
          { id: 5, quantity: 2 },
        ],
      });

      items.insert({ title: "Item 0" });
      items.insert({ title: "Item 1" });
      items.insert({ title: "Item 2" });  

      const res = nrml(inventory.find({ name: "Jonathan" }, {
        join: [{
          collection: items,
          from: "items.*.id",
          on: "_id",
          as: "userItems",
        }],
      }))[0];

      const its = items.find({ _id: { $oneOf: [3, 5] } });

      expect(res).toHaveProperty("userItems");

      expect((res as any).userItems).toEqual(its);
    });
  });
});
