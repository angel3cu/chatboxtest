import Row from './Row';

// NOTE: This is mostly for debugging purposes, just to show how the properties are extracted correctly.

export interface PreferencesProps {
  country?: string;
  continent?: string;
  destination?: string;
}

const Preferences = ({ country, continent, destination }: PreferencesProps) => {
  return (
    <div className="p-3 flex flex-col gap-2 w-xs">
      <Row key="country" name="Country" value={country} />
      <Row key="continent" name="Continent" value={continent} />
      <Row key="destination" name="Destination" value={destination} />
    </div>
  );
};

export default Preferences;
