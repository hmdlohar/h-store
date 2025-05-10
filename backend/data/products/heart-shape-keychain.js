const product = {
    isActive: true,
    name: "Heart Shape Keychain for Couple",
    slug: "heart-shape-keychain",
    category: "Keychain",
    description: `
    - Express your love: Personalize this keychain with a name, making it a thoughtful gift for a significant other, friend, or family member.
    - 3D printed with PLA: Made with durable and lightweight PLA bioplastic, this keychain is gentle on the environment.
    - Lightweight and compact: Easily attach it to your keys without adding bulk.
    - Perfect for customization: Choose a name, nickname, or initials to personalize your keychain
      `,
    mrp: 299,
    price: 149, 
    mainImage: {
      imagePath: "products/heart-shape-keychain/25.png",
    },
    customizations: [
      {
        fieldType: "text",
        field: "name1",
        label: "Enter Name 1",
        required: true,
        info: {
          uppercase: true,
          maxLength: 7,
        },
      },
      {
        fieldType: "text",
        field: "name2",
        label: "Enter Name 2",
        required: true,
        info: {
          uppercase: true,
          maxLength: 7,
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
        imagePath: "products/heart-shape-keychain/22.png",
      },
      {
        imagePath: "products/heart-shape-keychain/23.png",
      },
      {
        imagePath: "products/heart-shape-keychain/24.png",
      },
      {
        imagePath: "products/heart-shape-keychain/26.png",
      },
    ],
    // Additional details from text - schema might need adjustment
    // productDimensions: "20L x 5W Centimeters",
    // itemWeight: "70 Grams",
    // manufacturer: "Sajiya Gifts"
  };
  
  module.exports = product;
  