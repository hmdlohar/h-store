const product = {
  isActive: true,
  name: "Couple Name Plate",
  slug: "couple-name",
  category: "Dual Name",
  description: `
    - Unique and Personalized Gift: Perfect for couples, this dual name illusion creates a one-of-a-kind keepsake, ideal for anniversaries, weddings, or Valentine's Day.
    - Stunning 3D Design: The 3D flip name plate offers a captivating visual effect, showcasing both names in a single piece, adding a modern touch to any decor.
    - Compact and Elegant: Measuring at 2.9CM, this small yet impactful piece is designed to fit seamlessly into any space without overwhelming it.
    - Versatile Occasions: An excellent choice for various special occasions such as birthdays, anniversaries, or as a sweet gesture for your husband, wife, or boyfriend.
    - High-Quality Craftsmanship: Made with precision and attention to detail, ensuring a durable and beautiful keepsake that stands the test of time.
    - Memorable Keepsake: This personalized name plate serves as a constant reminder of your special bond, making it a cherished gift that your loved one will treasure forever.
    `,
  mrp: 799,
  price: 299, 
  mainImage: {
    imagePath: "products/dual-name/30.png",
  },
  variants: {
    "6 Characters": {
      price: 399,
      maxLength: 6,
    },
    "7 Characters": {
      price: 449,
      maxLength: 7,
    },
    "8 Characters": {
      price: 529,
      maxLength: 8,
    },
    "9 Characters": {
      price: 589,
      maxLength: 9,
    },
    "10 Characters": {
      price: 649,
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
      imagePath: "products/dual-name/29.png",
    },
    {
      imagePath: "products/dual-name/1.png",
    },
    {
      imagePath: "products/dual-name/2.png",
    },
    {
      imagePath: "products/dual-name/3.png",
    },
  ],
  // Additional details from text - schema might need adjustment
  // productDimensions: "20L x 5W Centimeters",
  // itemWeight: "70 Grams",
  // manufacturer: "Sajiya Gifts"
};

module.exports = product;
