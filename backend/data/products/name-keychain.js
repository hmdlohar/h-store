const product = {
  isActive: true,
  name: "Name Keychain Personalized",
  slug: "name-keychain-personalized",
  category: "Keychain",
  description: `
    - Perfect Gift Idea: Ideal for gifting to friends, family, and loved ones on special occasions.
    - Versatile Use: Suitable for keys, bags, or as a decorative accessory.
    - Customizable Design: Personalize your keychain with the name of your choice.
    - Memorable Keepsake: A unique and thoughtful way to cherish special relationships.
    - High-Quality Materials: Crafted from durable materials for long-lasting use.
      `,
  mrp: 299,
  price: 149,
  mainImage: {
    imagePath: "products/name-keychain/21.png",
  },
  customizations: [
    {
      fieldType: "text",
      field: "name",
      label: "Enter Name",
      required: true,
      info: {
        uppercase: true,
        maxLength: 8,
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
      imagePath: "products/name-keychain/20.png",
    },
    {
      imagePath: "products/name-keychain/19.png",
    },
    {
      imagePath: "products/name-keychain/set4.jpeg",
    },
    {
      imagePath: "products/name-keychain/Sajan.jpeg",
    },
  ],
  // Additional details from text - schema might need adjustment
  // productDimensions: "20L x 5W Centimeters",
  // itemWeight: "70 Grams",
  // manufacturer: "Sajiya Gifts"
};

module.exports = product;
