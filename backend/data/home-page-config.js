const homePageConfig = [
  {
    type: "banner",
    data: {
      image: "https://via.placeholder.com/150",
      title: "Welcome to our website",
      description: "This is a description of the banner",
    },
  },
  {
    type: "product",
    data: {
      slug: "product-1",
    },
  },
  {
    type: "product-row",
    data: {
      products: [
        {
          slug: "product-1",
        },
        {
          slug: "product-2",
        },
      ],
      title: "Our Products",
      description: "This is a description of the product row",
    },
  },
];
export default homePageConfig;
