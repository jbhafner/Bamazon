// ============ BAMAZONMANAGER.JS - MAIN MODULE ============= //

// ============ REQUIRE/LOAD NPM MODULES ============= //
var mysql = require('mysql');
var inquirer = require('inquirer');
var colors = require('colors');

// ------------ Set custom 'colors' theme --------------- //
colors.setTheme({
  boldUnderline: ['bold', 'underline']
});

// ============ CREATE MYSQL CONNECTION ============= //

var connection = mysql.createConnection({
  host     : 'localhost',
  port 	   : 3306,
  user     : 'bamazonUser',
  password : 'password',
  database : 'bamazon'
});

connection.connect();

// ============ INQUIRER FUNCTIONS/PROMPTS ============= //

// ------------ Manager Prompt Questions --------------- //
var lowInventory = 50;

var inquirerMgrOptions = [	"View Products for Sale",
							'View Low Inventory < ' + lowInventory + ' units',
							"Add to Inventory",
							"Add New Inventory"
];

var inquirerDepts = [	"Books",
						"Kindle",
						"AudioBooks"
];

// ------------ Add Inventory Questions --------------- //
var addInventoryQuestions = [{
	name: 'prodID',
	type: 'input',
	message: 'Enter product ID of item you for which you would like to add inventory.'
},{
	name: 'prodUnits',
	type: 'input',	
	message: 'How many units would you like to add?',
	default: 1
}];

// ------------ Add New Items Questions --------------- //
var addNewItemsQuestions = [{
	type: 'list',
	name: 'deptName',
	message: 'What Department would you like to add stock to? ',
	choices: inquirerDepts
},{
	name: 'ProdName',
	type: 'input',
	message: 'Enter Book, Kindle or AudioBook name: '
},{
	name: 'price',
	type: 'input',
	message: 'Enter price: '
},{	
	name: 'prodUnits',
	type: 'input',	
	message: 'How many units would you like to add? ',
	default: 1
}];


// ============ INQUIRER FUNCTIONS/PROMPTS ============= //

// ------------ Initial Questions/Prompt --------------- //
function userPrompt() {
	inquirer.prompt([{
		type: 'list',
		name: 'mgrAction',
		message: 'What action would you like to perform?',
		choices: inquirerMgrOptions,
	}]).then(function(pickAction) {
		var actionSelected = (pickAction.mgrAction);
		console.log(actionSelected);

		// VIEW PRODUCTS FOR SALE
		if(actionSelected==="View Products for Sale") {
			displayAllInventory();
			// connection.end();	
		} // ends -- if(actionSelected==="View Products for Sale")	

		// VIEW LOW INVENTORY
		else if(actionSelected==='View Low Inventory < ' + lowInventory + ' units') {
				connection.query('SELECT * from products WHERE stock_quantity < ' + lowInventory, function(error, results) {
				if(error) throw error;
				process.stdout.write('\033c');  // clear the screen
				console.log(("\n\n" + "   CURRENT INVENTORY WITH STOCK LESS THAN " + lowInventory + " UNITS " + "   ").black.bgMagenta);
				console.log("+++++++++++++++++++++++".gray);
				for (var i=0; i<results.length; i++) {
					console.log(`ID: ${results[i].id}`.inverse + " " + `Price: ${results[i].price}`.black.bgMagenta + ` Dept. Name: ${results[i].department_name}`.white +  " " + `Quantity in Stock: ${results[i].stock_quantity}`.boldUnderline);
					console.log(`Product: ${results[i].product_name}`);
					console.log(`=============================`.magenta);
				}
				console.log(i + ' items with current stock less than ' + lowInventory + '.');

				});	// close connection 1
				// connection.end();		
		} // ends -- elseif (actionSelected==="View Low Inventory (Count < 50)")

		// ADD TO INVENTORY
		else if (actionSelected==="Add to Inventory") {
			displayAllInventory();
			console.log('\nbefore call addInventory()\n');
			addInventory();
			// connection.end();
		} // ends -- elseif (actionSelected==="Add to Inventory")

		// ADD NEW INVENTORY
		else if (actionSelected==="Add New Inventory") {
			displayAllInventory();
			console.log('\nbefore call addInventory()\n');			
			addNewItem();
			// connection.end();
		} // ends -- elseif (actionSelected==="Add New Inventory"

	}); //end function pickAction()
} // end function userPrompt()

// ------------ Add stock to existing Inventory --------------- //

function addInventory() {
	console.log("\n");
	console.log('inside addInventory function');
	inquirer.prompt(addInventoryQuestions)
		.then(function(addInventoryResponse){
			var itemNum=(addInventoryResponse.prodID);
			var orderQuantity=parseInt(addInventoryResponse.prodUnits);
			connection.query('SELECT * from products where id =' + itemNum, function(error, results) { // connection 1
				if(error) throw error;
				var dbItemNum = results[0].id;
				var dbProdName = results[0].product_name;
				var dbPrice = results[0].price;
				var dbQuantity = results[0].stock_quantity;
				connection.query('UPDATE products SET stock_quantity = stock_quantity +' + orderQuantity +' where id =' + itemNum, function(error, results) { // connection 2
					console.log(`\nYou added ${orderQuantity} items toId: ${itemNum}`.inverse);
					console.log(`Product: ${dbProdName}`);
					console.log(`Quantity in Stock is now ${dbQuantity+orderQuantity}`);
					// connection.end();
					return;
				}); // closes connection.query 2
			}); // closes connection.query 1
		});
} //end function addInventory

// ------------ Add Completely New Item to inventory --------------- //

function addNewItem() {
	console.log("\n");
	console.log('\ninside addInventory function\n');
	inquirer.prompt(addNewItemsQuestions)
		.then(function(addNewItemsResponse){
			var deptName=(addNewItemsResponse.deptName);
			var prodName=(addNewItemsResponse.ProdName);
			var price=(addNewItemsResponse.price);
			var prodUnits=(addNewItemsResponse.prodUnits);
			var insertQry =('INSERT into products(product_name,department_name,price,stock_quantity)values('+ 
				'"' + prodName + '",' + '"' + deptName + '",' + price + ',' + prodUnits + ')');
			connection.query(insertQry, function(error, results) { // connection 1
				if(error) throw error;
				// console.log(`\nYou added Id: ${itemNum}`.inverse + ` | Department: ${deptName}`);
				console.log(`\nYou added Department: ${deptName} | Price: ${price} | Number of Units: ${prodUnits}`);
				console.log(`Product: ${prodName}`);
				// connection.end();
				return;
				}); // closes connection.query 2
			}); // closes connection.query 1
}

// ------------ Display all Inventory --------------- //
function displayAllInventory() {
	connection.query('SELECT * from products', function(error, results) {
	if(error) throw error;
	process.stdout.write('\033c');  // clear the screen
	console.log(("\n\n" + "   CURRENT INVENTORY   " + "   ").black.bgMagenta);
	console.log("+++++++++++++++++++++++".gray);
	for (var i=0; i<results.length; i++) {
		console.log(`ID: ${results[i].id}`.inverse + " " + `Price: ${results[i].price}`.black.bgMagenta + ` Dept. Name: ${results[i].department_name}`.white +  " " + `Quantity in Stock: ${results[i].stock_quantity}`.boldUnderline);
		console.log(`Product: ${results[i].product_name}`);
		console.log(`=============================`.magenta);
	}
	console.log('Number of records: ' + i);
	console.log("\n\n");
	// connection.end();
	// return;
	});	// close connection.query
} // end function displayAllInventory

// ============ START APP ============= //
process.stdout.write('\033c');  // clear the screen
console.log('\n    ' + ' Welcome to Bamazon Manager Center '.black.bgMagenta + "\n");
userPrompt();

