import RobotGrid from '../components/RobotGrid';

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Robot Grid</h1>
      <RobotGrid />
    </div>
  );
}