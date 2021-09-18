const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");
// const sequelize = require('./config/connection');


const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "D33st!!ny1234",
  database: "employees_db"
});

db.connect(function (err) {
    if (err) throw err;
    console.log(`Connected to the employees_db database.`)
    initialPrompt();
});

function initialPrompt() {
    inquirer.prompt({
        type: 'list',
        pageSize: 8,
        name: 'task',
        message: 'Which task would you like to perform?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Finish'
        ]
    }).then(function ({task}) {
        switch (task) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateRole();
                break;
            case 'Finish':
                console.log("Disconnecting from employees_db\n");
                db.end();
                break;
        }
    })
}

function viewDepartments(){
    db.query('SELECT * FROM department', function (err, result) {
        if (err) {
            console.log(err);
          }
          console.table(result);
          console.log("Viewing all departments\n");
          initialPrompt();
      });
}

function viewRoles () {
    db.query('SELECT r.title AS job_title, r.id AS role_id, d.name AS department, r.salary FROM role r LEFT JOIN department d ON r.department_id = d.id', function (err, result) {
        if (err) {
            console.log(err);
          }
          console.table(result);
          console.log("Viewing all roles\n");
          initialPrompt();
      });
}

function viewEmployees() {
    db.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id", function (err, result) {
        if (err) {
            console.log(err);
          }
          console.table(result);
          console.log("Viewing all employees\n");
          initialPrompt();
      });
}

function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'departmentName',
        message: 'What is the name of the new department?'
    }).then(data => {
        console.log("Updating departments\n");
        let query = `INSERT INTO department(name)
                     VALUES('${data.departmentName}')`;
        db.query(query, function (err, result) {
            if (err) throw err;

            viewDepartments();
        })
    })
}

function addRole() {
    inquirer.prompt([
        {
        type: 'input',
        name: 'roleName',
        message: 'What is the name of the new role?'
        },
        {
        type: 'input',
        name: 'roleSalary',
        message: 'What is the salary of this new role?'
        },
        {
        type: 'input',
        name: 'roleId',
        message: 'What is the department ID of this new role?'
        },
    ]).then(data => {
        console.log("Updating roles\n");
        let query = `INSERT INTO role(title,salary,department_id)
                     VALUES('${data.roleName}','${data.roleSalary}','${data.roleId}')`;
        db.query(query, function (err, result) {
            if (err) throw err;

            viewRoles();
        })
    })
}

function addEmployee() {
    inquirer.prompt([
        {
        type: 'input',
        name: 'firstName',
        message: 'What is the first name of this new employee?'
        },
        {
        type: 'input',
        name: 'lastName',
        message: 'What is the last name of this new employee?'
        },
        {
        type: 'input',
        name: 'roleId',
        message: 'What is the role ID of this new employee?'
        },
        {
        type: 'input',
        name: 'managerId',
        message: 'What is the ID for the manager of this new employee?'
        }
    ]).then(data => {
        console.log("Updating employees\n");
        let query = `INSERT INTO employee(first_name,last_name,role_id,manager_id)
                     VALUES('${data.firstName}','${data.lastName}','${data.roleId}','${data.managerId}')`;
        db.query(query, function (err, result) {
            if (err) throw err;

            viewEmployees();
        })
    })
}

function updateRole () {
    db.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id", function (err, result) {
        if (err) {
            console.log(err);
          }
          console.log("\n");
          console.log("Viewing employees to update\n");
          console.table(result);
          console.log("Viewing employees to update\n");
      });
    db.query('SELECT id, title FROM role', function (err, result) {
        if (err) {
            console.log(err);
          }
          console.log("Viewing role IDs\n");
          console.table(result);
          console.log("Viewing role IDs\n");
          newRole();
      });
}

function newRole () {
    inquirer.prompt([
        {
        type: 'input',
        name: 'id',
        message: 'What is the ID of the employee to be updated?'
        },
        {
        type: 'input',
        name: 'roleId',
        message: 'What is the new role ID for the employee to be updated?'
        }
    ]).then(input => {
        console.log("Updating employees\n");
        let query = `UPDATE employee
                    SET role_id = ${input.roleId}
                    WHERE id = ${input.id}`;

        db.query(query, function (err, result) {
            if (err) throw err;

            viewEmployees();
            console.log("Viewing updated employees\n");
        })
    })
}


// sequelize.sync({ force: false }).then(() => {
//     app.listen(PORT, () => console.log('Now listening'));
//   });