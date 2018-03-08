var inquirer = require("inquirer");
var mysql = require("mysql");
var colors = require("colors/safe");

var productData = [];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "L0ng4ndc0mpl1c4t3d!",
    database: "bamazon"
});

connection.connect(function (err, res) {
    if (err) throw err;
    console.log(colors.cyan("---------------------------------"));
    console.log(colors.cyan("|      Welcome to Bamazon!      |"));
    console.log(colors.cyan("|    The command line market    |"));
    console.log(colors.cyan("---------------------------------"));
    buyProduct();
});

function buyProduct() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productData.push(res[i]);
        }

        inquirer.prompt([{
            type: "list",
            message: "What would you like to purchase?",
            choices: function () {
                var choiceArr = [];
                for (var i = 0; i < productData.length; i++) {
                    choiceArr.push(productData[i].product_name + " | $" + productData[i].price);
                }
                return choiceArr;
            },
            name: "choice"
        }]).then(function (item) {
            var chosenProduct;

            for (var i = 0; i < productData.length; i++) {
                if (productData[i].product_name + " | $" + productData[i].price === item.choice) {
                    chosenProduct = productData[i];
                }
            }
            inquirer.prompt([{
                message: "How many would you like to buy?",
                validate: function (quantity) {
                    if (!isNaN(quantity) && quantity < chosenProduct.stock_quantity && quantity >= 0) {
                        return true;
                    } else if (!isNaN(quantity) && quantity > chosenProduct.stock_quantity) {
                        console.log(colors.red("\nSorry. There is insufficient stock for that purchase. Try again."));
                        return false;
                    } else if (!isNaN(quantity) && quantity < 0) {
                        console.log(colors.red("\nNegative quantities are not allowed. To start over, choose 0."));
                    } else {
                        return false;
                    }
                },
                name: "quantity"
            }]).then(function (purchase) {
                if (parseInt(purchase.quantity) === 0) {
                    buyProduct();
                } else {
                    
                    connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: (chosenProduct.stock_quantity - purchase.quantity),
                            product_sales: (chosenProduct.price * purchase.quantity)
                        },
                        {
                            item_id: chosenProduct.item_id
                        }
                    ], function (error) {
                        if (error) throw error;
                        console.log(colors.green("Purchase made! You bought " + purchase.quantity + " " + chosenProduct.product_name + " for $" + (parseFloat(chosenProduct.price).toFixed(2)) * parseInt(purchase.quantity)));
                        buyAgain();
                    });
                }
            });
        });
    });
}

function buyAgain() {
    inquirer.prompt([{
        type: "confirm",
        message: "Would you like to make another purchase?",
        name: "confirmation"
    }]).then(function (userRes) {
        if (userRes.confirmation) {
            buyProduct();
        } else {
            console.log(colors.yellow("Thanks for shopping! Come back soon!"));
            connection.end();
        }
    });
}