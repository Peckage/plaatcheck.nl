import { formatDate } from "@/utils/utilities";
import { DataRow } from "./data-row";

type FieldMap = {
    label: string;
    value: string | number | boolean | null;
};

type DataRecord = Record<string, string | number | boolean | null>;

const makeFieldMap = (obj: DataRecord, fields: Record<string, string>): FieldMap[] => {
    return Object.entries(fields)
        .filter(([key]) => obj[key] !== undefined && obj[key] !== null)
        .map(([key, label]) => ({
            label,
            value: typeof obj[key] === 'string' && obj[key].match(/^\d{8}$/) ? formatDate(obj[key]) : obj[key],
        }));
};

interface StructuredSectionProps {
    title: string;
    fields: Record<string, string>;
    data: DataRecord;
}

export const StructuredSection = ({ title, fields, data }: StructuredSectionProps) => {
    if (!data) return null;
    const items = makeFieldMap(data, fields);
    if (items.length === 0) return null;

    return (
        <section className="space-y-2">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 dark:text-gray-200">
                {items.map((item, idx) => (
                    <DataRow key={idx} label={item.label} value={item.value !== null ? String(item.value) : ''} />
                ))}
            </div>
        </section>
    );
};