const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/expenses", (req, res) => {
	res.json({ asd: "asd" });
	console.log("expenses");
});

app.post("/expenses", (req, res) => {
	const data = req.body;
	//create new expense
	const newExpense = {
		id: uuidv4(),
		...data,
	};
	//add to db or file => x.push(newExpense)
	res.status(201).json({
		message: "Expense created",
	});
});

app.put("/expenses/:id", (req, res) => {
	const id = req.params.id;
	const data = req.body;
	//update in db or file => x.map(x => x.id === id ? {...x, ...data} : x)
	res.status(200).json({
		message: "Expense updated",
	});
});

app.delete("/expenses/:id", (req, res) => {
	const id = req.params.id;
	//delete from db or file => x.filter(x => x.id !== id)
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

app.listen(3000);
