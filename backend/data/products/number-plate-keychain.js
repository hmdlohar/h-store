const product = {
  isActive: true,
  name: "Number Plate Key Chain for Car and Bike",
  slug: "number-plate-keychain",
  category: "Keychain",
  description: `
      - 3D Printed with plastic material
      - Customized Number Plate Key chain for Car And Bike
      - Unique gift for someone
        `,
  mrp: 299,
  price: 149,
  mainImage: {
    imagePath: "products/number-plate-keychain/12.png",
  },
  customizations: [
    {
      fieldType: "text",
      field: "text",
      label: "Enter Number Plate",
      required: true,
      info: {
        uppercase: true,
        maxLength: 10,
        minLength: 10,
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
      imagePath: "products/number-plate-keychain/13.png",
    },
    {
      imagePath: "products/number-plate-keychain/14.png",
    },
    {
      imagePath: "products/number-plate-keychain/15.png",
    },
  ],
  // Additional details from text - schema might need adjustment
  // productDimensions: "20L x 5W Centimeters",
  // itemWeight: "70 Grams",
  // manufacturer: "Sajiya Gifts"
};

module.exports = product;
