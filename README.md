# Bamazon
Amazon-like storefront using Node and MySQL

Welcome Screen: Choose to shop for Books, Kindle, or Audiobooks. Based on the inquirer selection, it will query the database for the correct department_name and return the appropriate list.





Next screen – I chose “AudioBooks” – it returns list of Audiobooks.  I chose item 36, with a quantity of 80.  There are only 75 in stock, so it returns a message of “insufficient quantity”.

























If there are enough in stock to fill the order, the system will generate a line indicating the product id, product name, number of units, price and total amount.  It will then update the stock_quantity in the products table and display the new quantity.



