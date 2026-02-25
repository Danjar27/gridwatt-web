export interface UpdateQuery<T> {
    id: string | number;
    data: Partial<Omit<T, 'id'>>;
}
