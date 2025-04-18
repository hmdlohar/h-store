import { Alert, LinearProgress } from "@mui/material";
import { parseErrorString } from "hyper-utils";

export default function LoadingErrorRQ({ q }) {
  return (
    <div>
      {q?.error && <Alert severity="error">{parseErrorString(q.error)}</Alert>}
      {q?.isLoading && <LinearProgress />}
    </div>
  );
}
