import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import ListSubheader from "@mui/material/ListSubheader";

export default function ForceBugReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const show_bug_report = () => {
    let test = useState(false);
  };

  return (
    <div
      className="layout_content wrapperMobile"
      subheader={
        <ListSubheader disableSticky={true}>Authentication</ListSubheader>
      }
    >
      {test ? <TEST /> : null}
    </div>
  );
}
