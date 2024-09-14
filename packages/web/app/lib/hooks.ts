import { useDispatch, useSelector } from "react-redux";

import type { Dispatch, State } from "./store";

export const useTypedSelector = useSelector.withTypes<State>();
export const useTypedDispatch = useDispatch.withTypes<Dispatch>();
