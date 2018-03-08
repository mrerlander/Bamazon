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
    console.log("|  Welcome Bamazon supervsior!  |");
    console.log("---------------------------------");
    supervisorStart();
});

function supervisorStart() {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do?",
        choices: ["View product sales by department", "Create new department"],
        name: "choice"
    }]).then(function (answer) {
        switch (answer.choice) {
            case "View product sales by department":
                printSales();
                break;

            case "Create new department":
                createDepartment();
                break;
        }
    });
}
// SELECT department_id, department_name, over_head_costs, SUM(products.product_sales) AS department_sales, (department.over_head_costs - SUM(products.product_sales) AS total_profit FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY products.department_name

function printSales() {
    connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS department_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name ORDER BY departments.department_id", function (err, res) {
        loop(res);

        var productTable = new Table;

        productData.forEach(function (product) {
            productTable.cell("Department ID", product.department_id);
            productTable.cell("Department Name", product.department_name);
            productTable.cell("Over Head Costs", product.over_head_costs);
            productTable.cell("Sales (USD)", "$" + product.department_sales);
            productTable.cell("Total Profit", "$" + product.total_profit);
            productTable.newRow();
        });

        console.log(productTable.toString());

        startOver();
    });
}

function createDepartment() {
    inquirer.prompt([{
        message: "What is the name of the department you want to add?",
        name: "deptName"
    }, {
        message: "What are the over head costs for the department?",
        validate: function (value) {
            if (!isNaN(value)) {
                return true;
            } else {
                return false;
            }
        },
        name: "deptCost"
    }]).then(function (answers) {
        connection.query("INSERT INTO departments SET ?", {
            department_name: answers.deptName,
            over_head_costs: answers.deptCost,
        }, function (err) {
            if (err) throw err;
            console.log(answers.deptName + " was succesfully added.");
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
            supervisorStart();
        } else {
            console.log("Bye!");
            connection.end();
        }
    });
}

function loop(res) {
    console.log(res);
    for (var i = 0; i < res.length; i++) {
        if (!res[i].department_sales){
            res[i].department_sales = 0;
            res[i].total_profit = 0 - res[i].over_head_costs;
        }
        productData.push(res[i]);
    };
}