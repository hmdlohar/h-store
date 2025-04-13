const product = {
  name: "Personalized Dual Name Illusion with Red Heart | 3D Flip Name Plate | Gift for Valentine, Anniversary, Birthday, Wedding",
  slug: "personalized-dual-name-illusion-red-heart-3d-flip-name-plate-gift-valentine-anniversary-birthday-wedding",
  category: "Dual Name",
  description:
    `
    - A wonderful gift for someone you love.
    - Stunning Duo-Tone Design: Featuring two colors in the base plate, this personalized gift boasts a visually striking appearance, enhancing its beauty and making it an ideal choice for any occasion.
    - Red heart makes it more attractive and makes it symbol of love.
    - Personalized 3D Flip Name Plate: Surprise your wife with a special gift featuring a 3D flip name plate customized with your names, perfect for birthdays, anniversaries, and wedding celebrations.
    - Thoughtful Birthday Gift for Wife: Make her birthday extra special with a thoughtful birthday gift for wife, showcasing your love and appreciation, perfect for memorable moments.
    `,
  mrp: 999,
  price: 399, // Base price for Upto 5 Characters
  mainImage: {
    imagePth: "products/dual-name-with-heart/1.png"
  },
  variants: {
    "6 Characters": {
      price: 399,
    },
    "7 Characters": {
      price: 449,
    },
    "8 Characters": {
      price: 529,
    },
    "9 Characters": {
      price: 589,
    },
    "10 Characters": {
      price: 649,
    },
  },
  images: [
    {
      imagePath: "products/dual-name-with-heart/2.png",
    },
    {
      imagePath: "products/dual-name-with-heart/3.png",
    }
  ],
  // Additional details from text - schema might need adjustment
  // productDimensions: "20L x 5W Centimeters",
  // itemWeight: "70 Grams",
  // manufacturer: "Sajiya Gifts"
};

module.exports = product;
