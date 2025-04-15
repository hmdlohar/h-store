export default function EcomImage(props) {
  let tr = "";
  if (props.thumbnail) {
    tr = "tr=w-300";
  }
  let src = props.path?`https://ik.imagekit.io/id4vmvhgeh/${props.path}?1=1&${tr}`:props.src;
  return <img {...props} />;
}
