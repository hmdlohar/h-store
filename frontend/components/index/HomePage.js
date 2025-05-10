import React from "react";

import { Box } from "@mui/material";
import Banner from "../home/Banner";
import Product from "../home/Product";
import ProductRow from "../home/ProductRow";

const HomePage = ({ homePageConfig }) => {
  return (
    <div className="home-page container mx-auto px-4">
      {homePageConfig.map((section, index) => {
        return (
          <Box key={index}>
            {(() => {
              switch (section.type) {
                case "banner":
                  return <Banner data={section.data} />;
                case "product":
                  return <Product data={section.data} />;
                case "product-row":
                  return <ProductRow data={section.data} />;
                default:
                  return null;
              }
            })()}
          </Box>
        );
      })}
    </div>
  );
};

export default HomePage;
