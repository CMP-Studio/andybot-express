exports.seed = async function (knex, Promise) {
    await knex("user").del();
    await knex("trivia").del();
    await knex("poll_response").del();
    await knex("stamp").del();

    return knex("user").insert([
		{ fb_page_id: "1234567", name: "Abhishek" },
		{ fb_page_id: "1234568", name: "Sam" },
		{ fb_page_id: "1234569", name: "Caroline" },
		{ fb_page_id: "1234560", name: "Regina" }
    ]);
    
    
    // return knex("products").del()
    // .then(() => {
    //   return knex("merchants").del();
    // })
    // .then(() => {
    //   return knex("merchants").insert(merchantsData);
    // })
    // .then(() => {
    //   let productPromises = [];
    //   productsData.forEach((product) => {
    //     let merchant = product.merchant;
    //     productPromises.push(createProduct(knex, product, merchant));
    //   });
    //   return Promise.all(productPromises);
    // });
};