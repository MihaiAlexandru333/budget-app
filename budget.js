const editModal = document.getElementById("edit-modal");
const modal = document.getElementById("modal");
const expenseButton = document.getElementById("add-expense");
const closeSpan = document.getElementsByClassName("close")[0];
const closeEditSpan = document.getElementsByClassName("close")[1];
const expenseDate = document.getElementById("date");
const editExpenseDate = document.getElementById("edit-date");
const categorySelect = document.getElementById("user-category-list");
const editCategorySelect = document.getElementById("edit-user-category-list");
const categoryAdd = document.getElementById("user-category");
const categoryText = document.getElementById("user-category-text");
const expenseAmount = document.getElementById("amount");
const editExpenseAmount = document.getElementById("edit-amount");
const addExpenseButton = document.getElementById("submit-expense");
const saveEditedExpense = document.getElementById("edit-submit-expense");
const radioButtons = document.querySelectorAll(
	'input[type="radio"][name="category"]'
);
const filterRadioButtons = document.querySelectorAll(
	'#filters input[type="radio"]'
);
const tableBody = document.getElementById("tableBody");
const pageNumber = document.getElementById("page-number");
const resetFilters = document.getElementById("reset");
const categoryFilter = document.getElementById("category-filter");
const itemsPerPage = 10;
let currentPage = 1;

const categories = [
	"UTILITIES",
	"FOOD",
	"ENTERTAINMENT",
	"HEALTH",
	"NON-ESSENTIAL",
];

let dbExpenses = (await JSON.parse(localStorage.getItem("dbExpenses"))) || [];

async function initialFetch() {
	const response = await fetch("http://localhost:3000/expenses");
	dbExpenses = await response.json();
	populateTable(dbExpenses);
	localStorage.setItem("dbExpenses", JSON.stringify(dbExpenses));
}
initialFetch();

let filteredDbExpenses = dbExpenses;

let userCategories = [];

const allCategories = [...categories, ...userCategories];

categories.forEach((cat) => {
	const li = document.createElement("li");
	const radio = document.createElement("input");

	radio.type = "radio";
	radio.name = "category";
	radio.value = cat.toLowerCase();

	radio.addEventListener("change", function () {
		radioValue = radio.value;
		console.log(radioValue);
	});

	li.appendChild(radio);

	const label = document.createElement("label");
	label.textContent = cat;
	li.appendChild(label);

	categorySelect.appendChild(li.cloneNode(true));
	editCategorySelect.appendChild(li.cloneNode(true));
});

/* open modal */
function handleOpenModal() {
	modal.style.display = "block";
	categoryText.value = "";
	expenseDate.value = "";
	expenseAmount.value = "";
	radioButtons.forEach((radio) => {
		radio.checked = false;
	});
}

function handleOpenEditModal() {
	editModal.style.display = "block";
}
expenseButton.addEventListener("click", handleOpenModal);

/* close modal */
function handleCloseModal() {
	modal.style.display = "none";
	editModal.style.display = "none";
	categoryText.value = "";
	expenseDate.value = "";
	expenseAmount.value = "";
}
closeSpan.addEventListener("click", handleCloseModal);
closeEditSpan.addEventListener("click", handleCloseModal);

function handleCloseModalOutsideClick(e) {
	if (e.target == modal || e.target == editModal) {
		modal.style.display = "none";
		editModal.style.display = "none";
	}
}
window.addEventListener("click", handleCloseModalOutsideClick);

categoryAdd.addEventListener("click", addCategory);

function addCategory() {
	const userCat = categoryText.value;
	if (userCat.length < 3) {
		alert("Must be at least 3 chars long");
		return;
	}

	userCategories.push(userCat);

	const li = document.createElement("li");

	const radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "category";
	radio.value = userCat.toLowerCase();
	radio.addEventListener("change", function () {
		radioValue = radio.value;
		console.log(radioValue);
	});
	li.appendChild(radio);

	const label = document.createElement("label");
	label.textContent = userCat;
	li.appendChild(label);

	const button = document.createElement("button");
	button.textContent = "X";
	button.addEventListener("click", function () {
		li.remove();
		userCategories = userCategories.filter((category) => category !== userCat);
	});

	li.appendChild(button);
	categorySelect.appendChild(li);

	categoryText.value = "";
	console.log(userCategories);
	addCategoryFilters(userCategories);
}

/* add expense */

addExpenseButton.addEventListener("click", addExpense);
async function addExpense(e) {
	let radioValue = null;
	e.preventDefault();
	const categoryRadio = document.querySelectorAll('input[name="category"]');

	let selectedRadio = null;
	categoryRadio.forEach((radioButton) => {
		if (radioButton.checked) {
			selectedRadio = radioButton;
		}
	});

	// Retrieve the value of the selected radio button
	if (selectedRadio) {
		radioValue = selectedRadio.value;
	}

	console.log("expense date value", expenseDate.value);
	console.log("radio value", radioValue);
	console.log("expense amount value", expenseAmount.value);
	if (!expenseDate.value || !radioValue || !expenseAmount.value) {
		alert("Please fill all fields");
		return;
	}

	const formData = {
		date: expenseDate.value,
		amount: expenseAmount.value,
		category: radioValue,
	};

	console.log("Form data:", formData);

	const response = await fetch("http://localhost:3000/expenses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(formData),
	});

	if (response.ok) {
		const data = await response.json();
		alert("Expense added successfully");
		console.log("Response:", data);
	} else {
		alert("Failed to add expense");
		console.error("Error:", response.status);
	}
	//reset modal fields
	expenseDate.value = "";
	expenseAmount.value = "";
	radioValue = "";
	modal.style.display = "none";
	initialFetch();
	//populate table
	populateTable(dbExpenses);
}

/* populate table */
function populateTable(expenses) {
	tableBody.innerHTML = "";

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentExpenses = expenses.slice(startIndex, endIndex);

	currentExpenses.forEach((item) => {
		const row = document.createElement("tr");
		row.innerHTML = `
			<td>${item.date}</td>
			<td>${item.category}</td>
			<td>${item.amount}</td>
			<td>
				<button class="delete-button" id="delete-button">Delete</button>
				<button class="edit-button" id="edit-button">Edit</button>
			</td>
		`;
		const editButton = row.querySelector(".edit-button");
		editButton.addEventListener("click", () => {
			editExpense(item.id);
		});
		const deleteButton = row.querySelector(".delete-button");
		deleteButton.addEventListener("click", () => {
			deleteExpense(item.id);
		});
		tableBody.appendChild(row);
	});
	updatePaginationControls(expenses);
}
populateTable(dbExpenses);

//edit expense
async function editExpense(expenseId) {
	const categoryRadio = document.querySelectorAll('input[name="category"]');
	let radioValue = "";

	editModal.style.display = "block";

	await fetch(`http://localhost:3000/expenses/${expenseId}`)
		.then((response) => response.json())
		.then((expense) => {
			// populate the modal with the expense data
			editExpenseDate.value = expense.date;
			editExpenseAmount.value = expense.amount;
			categoryRadio.forEach((radioButton) => {
				if (radioButton.value === expense.category) {
					radioButton.checked = true;
				} else {
					radioButton.checked = false;
				}
			});

			// add an event listener to the submit button
			saveEditedExpense.addEventListener("click", () => {
				const updatedExpense = {
					id: expenseId,
					date: editExpenseDate.value,
					amount: editExpenseAmount.value,
					category: expense.category,
				};

				let selectedRadio = null;
				categoryRadio.forEach((radioButton) => {
					if (radioButton.checked) {
						selectedRadio = radioButton;
					}
				});

				// Retrieve the value of the selected radio button
				if (selectedRadio) {
					updatedExpense.category = selectedRadio.value;
				}

				// Send a PUT request to the server to update the expense
				fetch(`http://localhost:3000/expenses/${expenseId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedExpense),
				})
					.then((response) => response.json())
					.then((data) => {
						// Update the UI with the updated expense data
						expense.date = data.expense.date;
						expense.amount = data.expense.amount;
						expense.category = data.expense.category;
						categoryRadio.forEach((radioButton) => {
							if (radioButton.value === data.expense.category) {
								radioButton.checked = true;
							} else {
								radioButton.checked = false;
							}
						});
						initialFetch();

						// Close the modal and reset
						editExpenseDate.value = "";
						editExpenseAmount.value = "";
						radioValue = "";
						editModal.style.display = "none";

						// Show a success message
						alert("Expense updated successfully");
					})
					.catch((error) => {
						console.error("Error:", error);
						alert("Failed to update expense");
					});
			});
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

async function deleteExpense(expenseId) {
	// Confirm the user wants to delete the expense
	const confirmDelete = confirm(
		"Are you sure you want to delete this expense?"
	);
	if (!confirmDelete) {
		return;
	}

	const index = dbExpenses.findIndex((expense) => expense.id === expenseId);
	if (index !== -1) {
		dbExpenses.splice(index, 1);
		localStorage.setItem("dbExpenses", JSON.stringify(dbExpenses));
		await fetch(`http://localhost:3000/expenses/${expenseId}`, {
			method: "DELETE",
		});
		const updatedExpenses = await fetch("http://localhost:3000/expenses").then(
			(response) => response.json()
			//alert the user that the expense was deleted
		);
		alert("Expense deleted successfully");
		populateTable(updatedExpenses);
	}
}

/* Sorting */
let sortOrder = 1;

function sortBy(property) {
	console.log("new sort function");
	sortOrder *= -1;

	const sorted = filteredDbExpenses.sort((a, b) => {
		const valueA = String(a[property]).padStart(10, "0");
		const valueB = String(b[property]).padStart(10, "0");
		if (valueA < valueB) {
			return -1 * sortOrder;
		} else if (valueA > valueB) {
			return 1 * sortOrder;
		} else {
			return 0;
		}
	});

	populateTable(sorted);
}

document
	.getElementById("date-header")
	.addEventListener("click", () => sortBy("date"));
document
	.getElementById("category-header")
	.addEventListener("click", () => sortBy("category"));
document
	.getElementById("amount-header")
	.addEventListener("click", () => sortBy("amount"));

/* pagination */
function updatePaginationControls(expenses) {
	const totalPages = Math.ceil(expenses.length / itemsPerPage);

	const paginationContainer = document.getElementById("pagination");
	paginationContainer.innerHTML = "";

	for (let i = 1; i <= totalPages; i++) {
		const pageLink = document.createElement("a");
		pageLink.href = "#";
		pageLink.textContent = i;
		pageLink.style.paddingLeft = "3px";
		pageLink.style.paddingRight = "3px";
		pageLink.addEventListener("click", () => {
			currentPage = i;
			populateTable(expenses);
		});
		paginationContainer.appendChild(pageLink);
	}
	pageNumber.innerHTML = `  Page: ${currentPage} / ${totalPages}`;
}

/* total */
let total = document.getElementById("total");
let sum = 0;

function getTotalAmount(expenses) {
	sum = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
	total.innerText = `Total: $${sum}`;
}

getTotalAmount(dbExpenses);

/* filters */

//amount filter
const amountOperator = document.getElementById("operator");
const applyButton = document.getElementById("apply-filters");
const amountOperatorMoney = document.getElementById("operator-amount");

applyButton.addEventListener("click", () => {
	applyFilters();
});

resetFilters.addEventListener("click", () => {
	filterRadioButtons.forEach((button) => {
		button.checked = false;
	});
	filteredDbExpenses = dbExpenses;
	categoryFilter.value = "";
	amountOperator.value = "";
	amountOperatorMoney.value = "";
	getTotalAmount(dbExpenses);
	updatePaginationControls(dbExpenses);
	populateTable(dbExpenses);
});

//category filter
function addCategoryFilters(categ) {
	categ.forEach((item) => {
		const option = document.createElement("option");
		option.value = item.toLowerCase();
		option.text = item;
		categoryFilter.appendChild(option);
	});
}
addCategoryFilters(allCategories);

//date filters
const dateRangeFilter = document.getElementById("date-range-filter");
const dateFilterFrom = document.getElementById("date-filter-from");
const dateFilterTo = document.getElementById("date-filter-to");
const saveDateRangeFilter = document.getElementById("date-range-save");
const resetDateRangeFilter = document.getElementById("date-range-reset");
const currentWeekFilter = document.getElementById("current-week-filter");
const currentMonthFilter = document.getElementById("current-month-filter");
const last3MonthsFilter = document.getElementById("last3-month-filter");
const last3WeeksFilter = document.getElementById("last3-week-filter");
const currentYear = document.getElementById("current-year-filter");
let toFilter = "";
let fromFilter = "";
let dateFilterChecked = "";

resetDateRangeFilter.addEventListener("click", resetDateRange);

dateRangeFilter.addEventListener("click", function () {
	if (this.checked) {
		console.log("Radio button checked");
		dateFilterChecked = "date-range";
		dateFilterFrom.addEventListener("change", getDateRange);
		dateFilterTo.addEventListener("change", getDateRange);
	} else {
		console.log("Radio button unchecked");
		dateFilterFrom.removeEventListener("change", getDateRange);
		dateFilterTo.removeEventListener("change", getDateRange);
	}
});

saveDateRangeFilter.addEventListener("click", () => {
	getDateRange();
});

function getDateRange() {
	toFilter = dateFilterTo.value;
	fromFilter = dateFilterFrom.value;
}

function resetDateRange() {
	toFilter = null;
	fromFilter = null;
	dateFilterFrom.value = "";
	dateFilterTo.value = "";
}

function getDateFilter(e) {
	resetDateRange();
	filteredDbExpenses = dbExpenses;
	dateFilterChecked = e.target.value;
	console.log("clicked radio", dateFilterChecked);
}

currentWeekFilter.addEventListener("click", getDateFilter);
currentMonthFilter.addEventListener("click", getDateFilter);
last3MonthsFilter.addEventListener("click", getDateFilter);
last3WeeksFilter.addEventListener("click", getDateFilter);
currentYear.addEventListener("click", getDateFilter);

function getDate(filter) {
	const currentDate = new Date();
	let startDate, endDate;

	switch (filter) {
		case "current-week":
			const weekStart = currentDate.getDate() - currentDate.getDay();
			const weekEnd = currentDate.getDate();
			startDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				weekStart
			);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				weekEnd
			);
			endDate.setHours(23, 59, 59, 999);
			break;
		case "current-month":
			startDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				1
			);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() + 1,
				0
			);
			endDate.setHours(23, 59, 59, 999);
			break;
		case "last3-month-filter":
			startDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() - 2,
				1
			);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date();
			endDate.setHours(23, 59, 59, 999);
			break;
		case "last3-week-filter":
			startDate = new Date();
			startDate.setDate(currentDate.getDate() - 21);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date();
			endDate.setHours(23, 59, 59, 999);
			break;
		case "current-year-filter":
			startDate = new Date(currentDate.getFullYear(), 0, 1);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date(currentDate.getFullYear(), 11, 31);
			endDate.setHours(23, 59, 59, 999);
			break;
		default:
			startDate = null;
			endDate = null;
			break;
	}

	return { startDate, endDate };
}

function applyFilters() {
	//reset
	filteredDbExpenses = [...dbExpenses];

	// amount filters
	const amount = parseFloat(amountOperatorMoney.value);
	const operator = amountOperator.value;
	const selectedCategory = categoryFilter.value;

	// Apply filters
	filteredDbExpenses = filteredDbExpenses.filter((item) => {
		const itemDate = new Date(new Date(item.date).setHours(0, 0, 0, 0));
		// Apply amount filter
		if (amount && operator) {
			const operators = {
				">=": (a, b) => a >= b,
				"<=": (a, b) => a <= b,
				"===": (a, b) => a == b,
			};
			if (!operators[operator](item.amount, amount)) return false;
		}

		// Apply category filter
		if (selectedCategory && item.category !== selectedCategory) return false;

		// Apply date range filter
		if (dateFilterChecked === "date-range" && fromFilter && toFilter) {
			if (!(itemDate >= fromFilter && itemDate <= toFilter)) return false;
		} else {
			// Apply other date filters if date range is not selected
			switch (dateFilterChecked) {
				case "current-week":
					const { startDate, endDate } = getDate(dateFilterChecked);
					if (!(itemDate >= startDate && itemDate <= endDate)) return false;
					break;
				case "current-month":
					const { startDate: startMonth, endDate: endMonth } =
						getDate(dateFilterChecked);
					if (!(itemDate >= startMonth && itemDate <= endMonth)) return false;
					break;
				case "last3-month-filter":
					const { startDate: start3Months, endDate: end3Months } =
						getDate(dateFilterChecked);
					if (!(itemDate >= start3Months && itemDate <= end3Months))
						return false;
					break;
				case "last3-week-filter":
					const { startDate: start3Weeks, endDate: end3Weeks } =
						getDate(dateFilterChecked);
					if (!(itemDate >= start3Weeks && itemDate <= end3Weeks)) return false;
					break;
				case "current-year-filter":
					const { startDate: startYear, endDate: endYear } =
						getDate(dateFilterChecked);
					if (!(itemDate >= startYear && itemDate <= endYear)) return false;
					break;
				default:
					console.log("no cases");
			}
		}

		return true;
	});
	populateTable(filteredDbExpenses);
	updatePaginationControls(filteredDbExpenses);
	getTotalAmount(filteredDbExpenses);
}
