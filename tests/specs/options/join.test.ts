import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("join", ({ test }) => {
    test("works", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets", integerIds: true, timestamps: false });

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
          options: {
            project: { _id: 0 },
          },
        }],
      }))[0];

      expect(res).toEqual({
        name: "Jonathan",
        tickets: [3, 4],
        userTickets: [
          { title: "Ticket 0", description: "Ticket 0 description" },
          { title: "Ticket 1", description: "Ticket 1 description" },
        ],
      });
    });

    test("will overwrite original property", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets", integerIds: true, timestamps: false });

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
          options: {
            project: { _id: 0 },
          }
        }],
      }))[0];

      const tks = tickets.find({ _id: { $oneOf: [3, 4] } });

      expect(res).toEqual({
        name: "Jonathan",
        tickets: [
          { title: "Ticket 0", description: "Ticket 0 description" },
          { title: "Ticket 1", description: "Ticket 1 description" },
        ],
      });
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

    test("creates the 'as' property even when nothing matches, dot notation", () => {
      const users = testCollection();
      const tickets = testCollection({ name: "tickets" });

      users.insert({ name: "Jonathan", tickets: [] });

      const res = nrml(users.find({ name: "Jonathan" }, {
        join: [{
          collection: tickets,
          from: "tickets",
          on: "_id",
          as: "user.tickets",
        }],
      }))[0];
      
      expect(res).toHaveProperty("user.tickets");
      expect((res as any).user.tickets).toEqual([]);
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

      expect(res).toEqual({
        name: "Jonathan",
        tickets: [3, 4],
        userTickets: [{ title: "Ticket 0" }, { title: "Ticket 1" }],
      });
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
      const users = testCollection({ timestamps: false });
      const tickets = testCollection({ name: "tickets", integerIds: true, timestamps: false });
      const seats = testCollection({ name: "seats", integerIds: true, timestamps: false });

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
            project: { _id: 0 },
            join: [{
              collection: seats,
              from: "seat",
              on: "_id",
              as: "ticketSeats",
              options: {
                project: { _id: 0 },
              }
            }]
          },
        }],
        project: { _id: 0 },
      }))[0];

      expect(res).toEqual({
        name: "Jonathan",
        tickets: [3, 4],
        userTickets: [
          {
            title: "Ticket 0",
            seat: 3,
            ticketSeats: [{ seat: "S3" }],
          },
          {
            title: "Ticket 1",
            seat: 5,
            ticketSeats: [{ seat: "S5" }],
          },
        ]
      });
    });

    test("with join.from and join.as dot notation, accessing array index on join.as", () => {
      const inventory = testCollection();
      const items = testCollection({ name: "items", integerIds: true });

      inventory.insert({
        name: "Jonathan",
        items: [
          { itemId: 3, quantity: 1 },
          { itemId: 5, quantity: 2 },
        ],
      });

      items.insert({ name: "The Unstoppable Force", atk: 100 }); // id 3
      items.insert({ name: "Sneakers", agi: 100 });              // id 4
      items.insert({ name: "The Immovable Object", def: 100 });  // id 5

      const res = nrml(inventory.find({ name: "Jonathan" }, {
        join: [{
          collection: items,
          from: "items.*.itemId",
          on: "_id",
          as: "items.*.itemData",
          options: {
            project: { _id: 0, _created_at: 0, _updated_at: 0 },
          }
        }],
      }))[0];

      expect(res).toEqual({
        name: "Jonathan",
        items: [
          { itemId: 3, quantity: 1, itemData: { name: "The Unstoppable Force", atk: 100 } },
          { itemId: 5, quantity: 2, itemData: { name: "The Immovable Object", def: 100 } },
        ],
      })
    });

    test("with join.from and join.as dot notation, no array '*' on join.as", () => {
      const inventory = testCollection();
      const items = testCollection({ name: "items", integerIds: true });

      inventory.insert({
        name: "Jonathan",
        items: [
          { itemId: 3, quantity: 1 },
          { itemId: 5, quantity: 2 },
        ],
        meta: {
          data: [],
        }
      });

      items.insert({ name: "The Unstoppable Force", atk: 100 }); // id 3
      items.insert({ name: "Sneakers", agi: 100 });              // id 4
      items.insert({ name: "The Immovable Object", def: 100 });  // id 5

      const res = nrml(inventory.find({ name: "Jonathan" }, {
        join: [{
          collection: items,
          from: "items.*.itemId",
          on: "_id",
          as: "meta.data",
          options: {
            project: { _id: 0, _created_at: 0, _updated_at: 0 },
          }
        }],
      }))[0];

      expect(res).toEqual({
        name: "Jonathan",
        items: [
          { itemId: 3, quantity: 1 },
          { itemId: 5, quantity: 2 },
        ],
        meta: {
          data: [
            { name: "The Unstoppable Force", atk: 100 },
            { name: "The Immovable Object", def: 100 }
          ],
        },
      });
    })
  });
});
