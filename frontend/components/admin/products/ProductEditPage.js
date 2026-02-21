import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/common/ImageUpload";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const defaultProduct = {
  name: "",
  slug: "",
  description: "",
  price: "",
  mrp: "",
  isActive: true,
  mainImage: { imagePath: "" },
  images: [],
  variants: {},
  customizations: [],
  rating: 0,
  reviewCount: 0,
  boughtCount: 0,
  specifications: {},
};

const defaultImage = { imagePath: "" };

const defaultCustomization = {
  fieldType: "text",
  field: "",
  label: "",
  required: false,
  options: [],
  info: {},
};

export default function ProductEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === "new";
  const queryClient = useQueryClient();

  const [product, setProduct] = useState(defaultProduct);
  const [variantKey, setVariantKey] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantExtra, setVariantExtra] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const productQuery = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await ApiService.call(`/api/admin/products/${id}`, "get");
      return res;
    },
    enabled: !!id && !isNew,
  });

  useEffect(() => {
    if (productQuery.data) {
      setProduct({
        ...defaultProduct,
        ...productQuery.data,
        price: productQuery.data.price?.toString() || "",
        mrp: productQuery.data.mrp?.toString() || "",
      });
    }
  }, [productQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (productData) => {
      const data = {
        ...productData,
        price: parseFloat(productData.price) || 0,
        mrp: parseFloat(productData.mrp) || 0,
        rating: parseFloat(productData.rating) || 0,
        reviewCount: parseInt(productData.reviewCount) || 0,
        boughtCount: parseInt(productData.boughtCount) || 0,
      };

      if (isNew) {
        return await ApiService.call("/api/admin/products", "post", data);
      } else {
        return await ApiService.call(`/api/admin/products/${id}`, "put", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      if (!isNew) {
        queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      }
      router.push("/admin/products");
    },
  });

  const handleChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddVariant = () => {
    if (variantKey.trim() && variantPrice.trim()) {
      const extra = {};
      if (variantExtra.trim()) {
        try {
          const parsed = JSON.parse(variantExtra);
          Object.assign(extra, parsed);
        } catch (e) {
          alert("Invalid JSON in extra fields");
          return;
        }
      }
      setProduct((prev) => ({
        ...prev,
        variants: {
          ...prev.variants,
          [variantKey.trim()]: {
            price: parseFloat(variantPrice) || 0,
            ...extra,
          },
        },
      }));
      setVariantKey("");
      setVariantPrice("");
      setVariantExtra("");
    }
  };

  const handleRemoveVariant = (key) => {
    setProduct((prev) => {
      const newVariants = { ...prev.variants };
      delete newVariants[key];
      return { ...prev, variants: newVariants };
    });
  };

  const handleUpdateVariant = (key, field, value) => {
    setProduct((prev) => {
      const newVariants = { ...prev.variants };
      if (newVariants[key]) {
        newVariants[key] = {
          ...newVariants[key],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        };
      }
      return { ...prev, variants: newVariants };
    });
  };

  const handleAddCustomization = () => {
    setProduct((prev) => ({
      ...prev,
      customizations: [...prev.customizations, { ...defaultCustomization }],
    }));
  };

  const handleUpdateCustomization = (index, field, value) => {
    setProduct((prev) => {
      const newCustomizations = [...prev.customizations];
      newCustomizations[index] = {
        ...newCustomizations[index],
        [field]: value,
      };
      return { ...prev, customizations: newCustomizations };
    });
  };

  const handleRemoveCustomization = (index) => {
    setProduct((prev) => ({
      ...prev,
      customizations: prev.customizations.filter((_, i) => i !== index),
    }));
  };

  const handleAddOption = (custIndex) => {
    setProduct((prev) => {
      const newCustomizations = [...prev.customizations];
      newCustomizations[custIndex].options.push({ code: "", name: "" });
      return { ...prev, customizations: newCustomizations };
    });
  };

  const handleUpdateOption = (custIndex, optIndex, field, value) => {
    setProduct((prev) => {
      const newCustomizations = [...prev.customizations];
      newCustomizations[custIndex].options[optIndex] = {
        ...newCustomizations[custIndex].options[optIndex],
        [field]: value,
      };
      return { ...prev, customizations: newCustomizations };
    });
  };

  const handleRemoveOption = (custIndex, optIndex) => {
    setProduct((prev) => {
      const newCustomizations = [...prev.customizations];
      newCustomizations[custIndex].options = newCustomizations[
        custIndex
      ].options.filter((_, i) => i !== optIndex);
      return { ...prev, customizations: newCustomizations };
    });
  };

  const handleAddImage = () => {
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, { imagePath: "" }],
    }));
  };

  const handleUpdateImage = (index, value) => {
    setProduct((prev) => {
      const newImages = [...prev.images];
      newImages[index] = { imagePath: value };
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setProduct((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpec = (key) => {
    setProduct((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleUpdateSpec = (oldKey, newKey, value) => {
    setProduct((prev) => {
      const newSpecs = { ...prev.specifications };
      if (oldKey !== newKey) {
        delete newSpecs[oldKey];
      }
      newSpecs[newKey] = value;
      return { ...prev, specifications: newSpecs };
    });
  };

  return (
    <Box>
      {/* Sticky Header with Action Buttons */}
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          p: 2,
          mb: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h1">
            {isNew ? "Add New Product" : "Edit Product"}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => saveMutation.mutate(product)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <LoadingErrorRQ q={saveMutation} />
      <LoadingErrorRQ q={productQuery} />

      {productQuery.data || isNew ? (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Product Name"
                  value={product.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Slug"
                  value={product.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  fullWidth
                  required
                  helperText="URL-friendly identifier (auto-generated if empty)"
                />
                <TextField
                  label="Description"
                  value={product.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Price"
                    value={product.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    type="number"
                    fullWidth
                    required
                  />
                  <TextField
                    label="MRP"
                    value={product.mrp}
                    onChange={(e) => handleChange("mrp", e.target.value)}
                    type="number"
                    fullWidth
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Rating (0-5)"
                    value={product.rating}
                    onChange={(e) => handleChange("rating", e.target.value)}
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: 5 }}
                    fullWidth
                  />
                  <TextField
                    label="Review Count"
                    value={product.reviewCount}
                    onChange={(e) => handleChange("reviewCount", e.target.value)}
                    type="number"
                    fullWidth
                  />
                  <TextField
                    label="Bought Past Month (Sales Proof)"
                    value={product.boughtCount}
                    onChange={(e) => handleChange("boughtCount", e.target.value)}
                    type="number"
                    fullWidth
                  />
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={product.isActive}
                      onChange={(e) => handleChange("isActive", e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Stack>
            </Box>

            <Divider />

          {/* Images */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Main Product Image
                </Typography>
                <ImageUpload
                  value={product.mainImage?.imagePath || ""}
                  onChange={(imageUrl) => handleChange("mainImage", { imagePath: imageUrl })}
                  aspectRatio={1}
                  label="Main Product Image"
                  size="medium"
                />
              </Box>
              <Typography variant="subtitle2">Additional Images:</Typography>
              {product.images.map((img, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ImageUpload
                    value={img.imagePath || ""}
                    onChange={(imageUrl) => handleUpdateImage(index, imageUrl)}
                    aspectRatio={1}
                    size="small"
                  />
                  <IconButton color="error" onClick={() => handleRemoveImage(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddImage}
              >
                Add Image
              </Button>
            </Stack>
          </Box>

            <Divider />

            {/* Variants */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Variants
              </Typography>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add New Variant
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Variant Name (e.g., Small, Large, 4 Characters)"
                      value={variantKey}
                      onChange={(e) => setVariantKey(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Price"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(e.target.value)}
                      type="number"
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Extra Properties (JSON, e.g., {&quot;maxLength&quot;: 4})"
                      value={variantExtra}
                      onChange={(e) => setVariantExtra(e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      helperText="Optional JSON with additional attributes like maxLength, sku, stock, etc."
                    />
                    <Button variant="contained" onClick={handleAddVariant} size="small">
                      Add Variant
                    </Button>
                  </Stack>
                </Paper>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Existing Variants:
                  </Typography>
                  {Object.entries(product.variants).map(([key, value]) => (
                    <Paper key={key} variant="outlined" sx={{ p: 2, mb: 1 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">{key}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleRemoveVariant(key)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                          <TextField
                            label="Price"
                            value={value.price || ""}
                            onChange={(e) => handleUpdateVariant(key, "price", e.target.value)}
                            type="number"
                            size="small"
                            sx={{ width: 150 }}
                          />
                          <TextField
                            label="maxLength"
                            value={value.maxLength || ""}
                            onChange={(e) => handleUpdateVariant(key, "maxLength", e.target.value)}
                            type="number"
                            size="small"
                            sx={{ width: 120 }}
                          />
                          <TextField
                            label="Other (JSON)"
                            value={JSON.stringify(
                              Object.keys(value).filter(k => !['price', 'maxLength'].includes(k)).reduce((obj, k) => ({...obj, [k]: value[k]}), {})
                            )}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                Object.keys(parsed).forEach(k => {
                                  handleUpdateVariant(key, k, parsed[k]);
                                });
                              } catch (err) {
                                // Invalid JSON, ignore
                              }
                            }}
                            size="small"
                            sx={{ width: 200 }}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Specifications */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Specifications
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Add New Specification</Typography>
                <Stack direction="row" spacing={2}>
                  <TextField 
                    label="Label (e.g., Weight)" 
                    value={specKey} 
                    onChange={(e) => setSpecKey(e.target.value)} 
                    size="small"
                    fullWidth
                  />
                  <TextField 
                    label="Value (e.g., 500g)" 
                    value={specValue} 
                    onChange={(e) => setSpecValue(e.target.value)} 
                    size="small"
                    fullWidth
                  />
                  <Button variant="contained" onClick={handleAddSpec} size="small">Add</Button>
                </Stack>
              </Paper>
              <Stack spacing={1}>
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <Paper key={key} variant="outlined" sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontWeight: 700, minWidth: 150 }}>{key}:</Typography>
                    <TextField 
                      value={value} 
                      onChange={(e) => handleUpdateSpec(key, key, e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <IconButton color="error" onClick={() => handleRemoveSpec(key)}>
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Customizations */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Customizations
              </Typography>
              <Stack spacing={2}>
                {product.customizations.map((cust, index) => (
                  <Accordion key={index} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        {cust.label || `Customization ${index + 1}`} ({cust.fieldType})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <FormControl fullWidth>
                            <InputLabel>Field Type</InputLabel>
                            <Select
                              value={cust.fieldType}
                              label="Field Type"
                              onChange={(e) =>
                                handleUpdateCustomization(index, "fieldType", e.target.value)
                              }
                            >
                              <MenuItem value="text">Text</MenuItem>
                              <MenuItem value="text_alphabet">Text (Alphabet Only)</MenuItem>
                              <MenuItem value="color">Color</MenuItem>
                              <MenuItem value="image">Image</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            label="Field ID"
                            value={cust.field}
                            onChange={(e) =>
                              handleUpdateCustomization(index, "field", e.target.value)
                            }
                            fullWidth
                          />
                          <TextField
                            label="Label"
                            value={cust.label}
                            onChange={(e) =>
                              handleUpdateCustomization(index, "label", e.target.value)
                            }
                            fullWidth
                          />
                          <TextField
                            label="Description (shown to user)"
                            value={cust.description || ""}
                            onChange={(e) =>
                              handleUpdateCustomization(index, "description", e.target.value)
                            }
                            fullWidth
                            placeholder="e.g., Enter name as you want it on the product"
                          />
                        </Stack>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={cust.required}
                              onChange={(e) =>
                                handleUpdateCustomization(index, "required", e.target.checked)
                              }
                            />
                          }
                          label="Required"
                        />
                        {cust.fieldType === "color" && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Options:
                            </Typography>
                            {cust.options.map((opt, optIndex) => (
                              <Stack key={optIndex} direction="row" spacing={1} sx={{ mb: 1 }}>
                                <TextField
                                  label="Code (e.g., #FF0000)"
                                  value={opt.code}
                                  onChange={(e) =>
                                    handleUpdateOption(index, optIndex, "code", e.target.value)
                                  }
                                  size="small"
                                />
                                <TextField
                                  label="Name (e.g., Red)"
                                  value={opt.name}
                                  onChange={(e) =>
                                    handleUpdateOption(index, optIndex, "name", e.target.value)
                                  }
                                  size="small"
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveOption(index, optIndex)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Stack>
                            ))}
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddOption(index)}
                            >
                              Add Option
                            </Button>
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveCustomization(index)}
                        >
                          Remove Customization
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddCustomization}
                >
                  Add Customization
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      ) : (
        <LoadingErrorRQ q={productQuery} />
      )}
    </Box>
  );
}
