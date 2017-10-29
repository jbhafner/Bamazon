// ============ BAMAZONCUSTOMER.JS - MAIN MODULE ============= //

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

// ============ INQUIRER QUESTIONS ============= //

// ------------ Store Purchase Questions --------------- //
var inquirerQuestPurchase = [{
	name: 'prodID',
	message: 'Enter product ID of item you would like to purchase.'
},{
	name: 'prodUnits',
	message: 'How many units would you like to buy?',
	default: 1
}];

// ============ INQUIRER FUNCTIONS/PROMPTS ============= //

// ------------ Initial Questions/Prompt --------------- //
function userPrompt() {
	inquirer.prompt([{
		type: 'list',
		name: 'prodType',
		message: 'What would you like to shop for?',
		choices: ['Books','Kindle', 'AudioBook'],
	}]).then(function(pickProd){
		var productSelected = (pickProd.prodType)
		console.log(productSelected);
		console.log('SELECT * from products where department_name ="'+ productSelected + '"');
		connection.query('SELECT * from products where department_name ="'+ productSelected + '"', function(error, results) {
		console.log("just before connection established");
			console.log("connection established");
			if(error) throw error;
			process.stdout.write('\033c');  // clear the screen
			console.log(("\n\n" + "   CURRENT INVENTORY   " + productSelected + "   ").black.bgMagenta);
			console.log("+++++++++++++++++++++++".gray);
			for (var i=0; i<results.length; i++) {
				console.log(`ID: ${results[i].id}`.inverse + " " + `Price: ${results[i].price}`.black.bgMagenta + ` Dept. Name: ${results[i].department_name}`.white +  " " + `Quantity in Stock: ${results[i].stock_quantity}`.boldUnderline);
				console.log(`Product: ${results[i].product_name}`);
				console.log(`=============================`.magenta);
			}
			console.log('Number of records: ' + i);
			// --- Call purchasePrompt() to process order --- //
			purchasePrompt();
		}) // close connection.query 1		
	})//end function pickProd()
} // end function userPrompt()

// ------------ Purchase Prompt --------------- //
function purchasePrompt() {
	console.log("\n");
	inquirer.prompt(inquirerQuestPurchase)
		.then(function(purchPrompt){
			var itemNum=(purchPrompt.prodID);
			var orderQuantity=(purchPrompt.prodUnits);
			connection.query('SELECT * from products where id =' + itemNum, function(error, results) { // connection 1
				if(error) throw error;
				// console.log(results);
				var dbItemNum = results[0].id;
				var dbProdName = results[0].product_name;
				var dbPrice = results[0].price;
				var dbQuantity = results[0].stock_quantity;
				if (dbQuantity<orderQuantity) {
					console.log("\n\nSorry, insufficient quantity to fill your order");
					return;
				} else {
					connection.query('UPDATE products SET stock_quantity = stock_quantity -' + orderQuantity +' where id =' + itemNum, function(error, results) { // connection 2
						console.log(`\n\nYou purchased Id: ${itemNum}`.inverse);
						console.log(`Product: ${dbProdName}`);
						console.log(`Units: ${orderQuantity} | Price: ${dbPrice} | ` + `Total Amount: ${(orderQuantity * dbPrice).toFixed(2)}`.black.bgMagenta);

						console.log(`Quantity in Stock is now ${dbQuantity-orderQuantity}`);
						connection.end();
						return;
					}) // closes connection.query 2
				}
				// connection.end();
			}) // closes connection.query 1

		})
		// connection.end();
} //end function purchasePrompt
// connection.end();

// ============ START APP ============= //
process.stdout.write('\033c');  // clear the screen
console.log('\n    ' + ' Welcome to Bamazon Customer Center '.black.bgMagenta + "\n");
userPrompt();



