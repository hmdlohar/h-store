export default function EcomImage(props) {
  const { thumbnail, small, path, ...rest } = props;
  let tr = "";
  if (thumbnail) {
    tr = "tr=w-300";
  } else if (small) {
    tr = "tr=w-100";
  }
  let src = path
    ? `https://ik.imagekit.io/id4vmvhgeh/${path}?1=1&${tr}`
    : props.src;
  return <img {...rest} src={src} />;
}
