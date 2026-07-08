import ExistingHealthDataEntry from "./HealthDataEntry.jsx";

type Props = {
  patientId?: string;
};

export default function HealthDataEntry(props: Props) {
  return <ExistingHealthDataEntry {...props} />;
}
