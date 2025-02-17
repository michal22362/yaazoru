import getConnection from "../connection";
import { Knex } from "knex"

const createMonthlyPayment = async () => {
    console.log('create monthlyPayment schema');

    const knex = getConnection();
    try {
        const tableExists = await knex.schema.withSchema("yaazoru").hasTable("monthlyPayment");
        if (!tableExists) {
            console.log('Creating monthlyPayment table...');
            await knex.schema.withSchema("yaazoru").createTable("monthlyPayment", (table: Knex.TableBuilder) => {
                table.increments("monthlyPayment_id").primary();
                table.string("customer_id").notNullable();
                table.date("start_date").notNullable();
                table.integer("total_amount").notNullable();
                table.string("frequency").notNullable();
                table.date("next_charge").notNullable();
                table.date("last_attempt").notNullable();
                table.date("last_sucsse").notNullable();
                table.date("created_at").notNullable();
                table.date("update_at").notNullable();
                table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
            });
            console.log('monthlyPayment table created successfully.');
        }
        else {
            console.log("monthlyPayment table already exists. Skipping creation.");
        }

    } catch (err) {
        console.error('error creat schema monthlyPayment', err)
    }
}

export { createMonthlyPayment };
