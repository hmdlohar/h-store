import { useMediaQuery } from "@mui/material";

export default function EcomImage(props) {
  const { thumbnail, small, path, tr: trProp, adaptToMobile, ...rest } = props;
  const isMobile = useMediaQuery("(max-width: 668px)");
  let tr = trProp || "";
  if (thumbnail) {
    tr = isMobile ? "tr=w-175" : "tr=w-300";
  } else if (small) {
    tr = "tr=w-100";
  } else if (adaptToMobile && isMobile) {
    tr = "tr=w-500";
  }
  let src = path
    ? `https://ik.imagekit.io/id4vmvhgeh/${path}?1=1&${tr}`
    : props.src;
  return <img {...rest} src={src} alt={props.alt} />;
}
