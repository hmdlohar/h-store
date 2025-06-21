const product = {
  isActive: false,
  name: "Couple Name (Two color)",
  slug: "couple-name-two-color",
  category: "Dual Name",
  description: `
    - Stunning Duo-Tone Design: Featuring two colors in the base plate, this personalized gift boasts a visually striking appearance, enhancing its beauty and making it an ideal choice for any occasion.
    - Personalized 3D Flip Name Plate: Surprise your wife with a special gift featuring a 3D flip name plate customized with your names, perfect for birthdays, anniversaries, and wedding celebrations.
    - Symbolic Dual Name Plank 3D: Commemorate your years together with a dual name plank 3D, symbolizing your enduring love and commitment, perfect for anniversary celebrations.
    - Thoughtful Birthday Gift for Wife: Make her birthday extra special with a thoughtful birthday gift for wife, showcasing your love and appreciation, perfect for memorable moments.
    - Unique Husband and Wife Name Plate: Celebrate your wedding anniversary with a unique husband and wife name plate, personalized to mark the occasion, ideal for anniversary gifts.
    - Versatile Flip Name Gift: Whether it's an engagement ring platter or a flip name gift, find the perfect present for any milestone in your relationship, making each moment memorable.        
      `,
  mrp: 999,
  price: 219,
  mainImage: {
    imagePath: "products/dual-name-two-color/43.png",
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
  images: [
    {
      imagePath: "products/dual-name-two-color/41.png",
    },
    {
      imagePath: "products/dual-name-two-color/42.png",
    },
    {
      imagePath: "products/dual-name-two-color/40.png",
    },
    {
      imagePath: "products/dual-name-two-color/44.png",
    },
  ],
};

module.exports = product;
