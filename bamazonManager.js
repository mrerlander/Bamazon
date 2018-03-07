var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("easy-table");

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
    console.log("---------------------------------");
    console.log("|    Welcome Bamazon manager    |");
    console.log("---------------------------------");
    managerStart();
});

function managerStart() {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do today?",
        choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"],
        name: "choice"
    }]).then(function (response) {
        switch (response.choice) {
            case "View products for sale":
                printProducts();
                break;

            case "View low inventory":
                lowInventory();
                break;

            case "Add to inventory":
                addInventory();
                break;

            case "Add new product":
                newProduct();
                break;
        }
    });
}

function printProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productData.push(res[i]);
        }

        var productTable = new Table;

        productData.forEach(function (product) {
            productTable.cell("Product ID", product.item_id);
            productTable.cell("Product", product.product_name);
            productTable.cell("Department", product.department_name);
            productTable.cell("Price (USD)", "$" + product.price);
            productTable.cell("Stock", product.stock_quantity);
            productTable.newRow();
        });

        console.log(productTable.toString());

        startOver();
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= '10'", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productData.push(res[i]);
        }

        var lowTable = new Table;

        productData.forEach(function (product) {
            lowTable.cell("Product ID", product.item_id);
            lowTable.cell("Product", product.product_name);
            lowTable.cell("Department", product.department_name);
            lowTable.cell("Price (USD)", "$" + product.price);
            lowTable.cell("Stock", product.stock_quantity);
            lowTable.newRow();
        });

        console.log(lowTable.toString());

        startOver();
    });
}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productData.push(res[i]);
        }
        inquirer.prompt([{
            type: "list",
            message: "Choose the product you would like to add stock to.",
            choices: function () {
                var choiceArr = [];
                for (var i = 0; i < productData.length; i++) {
                    choiceArr.push(productData[i].product_name);
                }
                return choiceArr;
            },
            name: "product"
        }, {
            message: "How much stock would you like to add?",
            validate: function (value) {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else if (!isNaN(value) && value === 0) {
                    managerStart();
                } else if (!isNaN(value) && value < 0) {
                    console.log("\nNegative values are not allowed. To go to the main menu, type '0'.");
                } else {
                    return false;
                }
            },
            name: "quantity"
        }]).then(function (answers) {
            var chosenProduct;

            for (var i = 0; i < productData.length; i++) {
                if (productData[i].product_name === answers.product) {
                    chosenProduct = productData[i];
                }
            }

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: parseInt(chosenProduct.stock_quantity) + parseInt(answers.quantity)
            }, {
                item_id: chosenProduct.item_id
            }], function (error) {
                if (error) throw error;
                console.log("Successfully added " + answers.quantity + " to " + answers.product);
                startOver();
            });
        });
    });
}

function newProduct() {
    inquirer.prompt([{
        message: "What is the name of the product you want to add?",
        name: "itemName"
    }, {
        message: "What department sells this product?",
        name: "itemDept"
    }, {
        message: "How much does the product cost?",
        validate: function (value) {
            if (!isNaN(value)) {
                return true;
            } else {
                return false;
            }
        },
        name: "itemPrice"
    }, {
        message: "How many would you like to add to stock?",
        validate: function (value) {
            if (!isNaN(value)) {
                return true;
            } else {
                return false;
            }
        },
        name: "itemStock"
    }]).then(function (answers) {
        connection.query("INSERT INTO products SET ?", {
            product_name: answers.itemName,
            department_name: answers.itemDept,
            price: answers.itemPrice,
            stock_quantity: answers.itemStock
        }, function (err) {
            if (err) throw err;
            console.log(answers.itemName + " was succesfully added.");
            startOver();
        });
    });
}

function startOver() {
    inquirer.prompt([{
        type: "confirm",
        message: "Would you like to do something else?",
        name: "confirmation"
    }]).then(function (userRes) {
        if (userRes.confirmation) {
            productData = [];
            managerStart();
        } else {
            console.log("Bye!");
            connection.end();
        }
    });
}