const express = require("express");
const { v4: uuidv4 } = require("uuid");
const expenses = require("./mockExpenses.json");
const fs = require("fs");

const app = express();
app.use(express.json());

app.get("/expenses", (req, res) => {
	res.json(expenses);
	console.log("expenses");
});

app.post("/expenses", (req, res) => {
	const data = req.body;
	//create new expense
	const newExpense = {
		id: uuidv4(),
		...data,
	};
	//add to db or file
	expenses.push(newExpense);
	//rescriu tot fisierul ca nu merge sa adaugi in el doar noul obiect ca face figuri ca e invalid json
	fs.writeFile("mockExpenses.json", JSON.stringify(expenses), (err) => {
		if (err) {
			console.log(err);
			throw err;
		}
		console.log("Expense added to file");
	});
	res.status(201).json({
		message: "Expense created",
		expense: newExpense,
	});
});

app.put("/expenses/:id", (req, res) => {
	const id = req.params.id;
	const data = req.body;
	//update in db or file => x.map(x => x.id === id ? {...x, ...data} : x)
	//ar trebui iterat prin expenses si gasit obiectul cu id-ul respectiv si updatat dar nu avem edit in aplicatie (putem implementa daca vrem)
	res.status(200).json({
		message: "Expense updated",
	});
});

app.delete("/expenses/:id", (req, res) => {
	const id = req.params.id;
	//delete from db or file => x.filter(x => x.id !== id)
	//ar trebui iterat prin expenses si gasit obiectul cu id-ul respectiv si sters dar nu avem delete in aplicatie (putem implementa si asta daca vrem)
	res.status(204).json({
		message: "Expense deleted",
	});
});

app.get("categories", (req, res) => {
	//get categories from db or file
	res.json({ categories: [] });
});

app.post("categories", (req, res) => {
	const data = req.body;
	//create new category
	const newCategory = {
		...data,
	};
	//add to db or file => x.push(newCategory)
	res.status(201).json({
		message: "Category created",
	});
});

app.put("categories/:id", (req, res) => {
	const id = req.params.id;
	const data = req.body;
	//update in db or file => x.map(x => x.id === id ? {...x, ...data} : x)
	res.status(200).json({
		message: "Category updated",
	});
});

app.delete("categories/:id", (req, res) => {
	const id = req.params.id;
	//delete from db or file => x.filter(x => x.id !== id)
	res.status(204).json({
		message: "Category deleted",
	});
});

app.listen(3000, () => console.log("Server running on port 3000"));
