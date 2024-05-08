// Function to generate random date between two years
function randomDate(start, end) {
	const date = new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

// Array of categories
const categories = [
	"utilities",
	"food",
	"entertainment",
	"health",
	"non-essential",
];

// Function to generate random category
function randomCategory() {
	return categories[Math.floor(Math.random() * categories.length)];
}

// Function to generate random amount
function randomAmount() {
	return Math.floor(Math.random() * 1000); // Generating amount between 0 and 999
}

// Generate array with 50 objects
export const array = Array.from({ length: 50 }, () => ({
	id: parseInt(generateId()),
	amount: randomAmount(),
	category: randomCategory(),
	date: randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31)),
}));

function generateId() {
	const timestamp = Date.now();
	const randomNumber = Math.floor(Math.random() * 10000);
	return `${timestamp}${randomNumber}`;
}
