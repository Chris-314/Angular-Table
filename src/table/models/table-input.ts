import { Observable } from "rxjs";

export type TableInput<T> = T[] | Promise<T> | Observable<T>


