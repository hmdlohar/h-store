const product = {
  isActive: true,
  name: "Couple Name (Red Heart)",
  slug: "couple-name-red-heart",
  category: "Dual Name",
  description: `
    - A wonderful gift for someone you love.
    - Stunning Duo-Tone Design: Featuring two colors in the base plate, this personalized gift boasts a visually striking appearance, enhancing its beauty and making it an ideal choice for any occasion.
    - Red heart makes it more attractive and makes it symbol of love.
    - Personalized 3D Flip Name Plate: Surprise your wife with a special gift featuring a 3D flip name plate customized with your names, perfect for birthdays, anniversaries, and wedding celebrations.
    - Thoughtful Birthday Gift for Wife: Make her birthday extra special with a thoughtful birthday gift for wife, showcasing your love and appreciation, perfect for memorable moments.
    `,
  mrp: 999,
  price: 219, // Base price for Upto 4 Characters
  mainImage: {
    imagePath: "products/dual-name-with-heart/1.png",
  },
  variants: {
    "4 Characters": {
      price: 219,
      maxLength: 4,
    },
    "5 Characters": {
      price: 249,
      maxLength: 5,
    },
    "6 Characters": {
      price: 299,
      maxLength: 6,
    },
    "7 Characters": {
      price: 349,
      maxLength: 7,
    },
    "8 Characters": {
      price: 399,
      maxLength: 8,
    },
    "9 Characters": {
      price: 449,
      maxLength: 9,
    },
    "10 Characters": {
      price: 499,
      maxLength: 10,
    },
  },
  customizations: [
    {
      fieldType: "text",
      field: "name1",
      label: "Enter Name 1",
      required: true,
      info: {
        uppercase: true,
      },
    },
    {
      fieldType: "text",
      field: "name2",
      label: "Enter Name 2",
      required: true,
      info: {
        uppercase: true,
      },
    },
    {
      fieldType: "color",
      field: "color",
      label: "Select Color",
      options: [
        {
          code: "#000000",
          name: "Black",
        },
        {
          code: "#FFFFFF",
          name: "White",
        },
        {
          code: "#FF0000",
          name: "Red",
        },
        {
          code: "#C39BD3",
          name: "Violet",
        },
      ],
      required: true,
    },
  ],
  images: [
    {
      imagePath: "products/dual-name-with-heart/2.png",
    },
    {
      imagePath: "products/dual-name-with-heart/3.png",
    },
  ],
  // Additional details from text - schema might need adjustment
  // productDimensions: "20L x 5W Centimeters",
  // itemWeight: "70 Grams",
  // manufacturer: "Sajiya Gifts"
};

module.exports = product;
