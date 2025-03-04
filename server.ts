import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import { Pool } from "pg";
import z from "zod";

class Logger {
	static log(text: string) {
		const date = new Date();
		console.log(`${date.toUTCString()} | ${text}`);
	}
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: Number(process.env.DB_PORT),
});

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const offer = z.object({
	id: z.number().optional().nullable(),
	company: z.string(),
	title: z.string(),
	uop: z.string().optional().nullable(),
	uz: z.string().optional().nullable(),
	b2b: z.string().optional().nullable(),
	technologies: z.string().optional().nullable(),
	link: z.string(),
	createdAt: z.string().optional().nullable(),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
	try {
		const result = await pool.query("SELECT * FROM offers");
		res.json({ result: result.rows });
	} catch (err) {
		Logger.log(err);
		res.status(500).json({ error: "Database connection failed" });
	}
});

app.get("/mail", async (req, res) => {
	try {
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: process.env.EMAIL_USER,
			subject: `TEST`,
			text: `TEST`,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				Logger.log(`Error: ${error}`);
			} else {
				Logger.log(`Email sent: ${info.response})`);
			}
		});
	} catch (err) {
		Logger.log(err);
		res.status(500).json({ error: "Database connection failed" });
	}
});

app.post("/offers", async (req, res) => {
	try {
		const body = req.body;
		const parsedData = offer.safeParse(body);

		if (parsedData.success === false) {
			Logger.log("Invalid body");
			res.status(400).json({ error: "Invalid body" });
			return;
		}
		const {
			data: { company, title, uop, uz, b2b, technologies, link },
		} = parsedData;

		const result = await pool.query(
			`SELECT * FROM offers WHERE link = '${link}'`
		);

		if (result.rows.length > 0) {
			Logger.log("Already exists");
			res.status(400).json({ error: "Already exists" });
			return;
		}

		const insert = await pool.query(
			`
			INSERT INTO offers (company, title, uop, uz, b2b, technologies, link)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING *`,
			[company, title, uop, uz, b2b, technologies, link]
		);

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: process.env.EMAIL_USER,
			subject: `New Job offer, ${title}, ${company}`,
			text: `${title} \n ${company} \n uop:${uop} / b2b:${b2b} / uz:${uz} \n ${technologies} \n ${link}`,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				Logger.log(`Email error: ${error}`);
			} else {
				Logger.log(`Email sent: ${info.response}`);
			}
		});

		res.json({ result: insert.rows[0] });
	} catch (err) {
		Logger.log(`${err}`);
		res.status(500).json({ error: "Unknown error" });
	}
});

app.listen(port, () => {
	Logger.log(`Server is running on port ${port}`);
});
