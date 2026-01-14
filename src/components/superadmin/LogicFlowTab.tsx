import FlowDiagram from './FlowDiagram';
import FlowStepDetails from './FlowStepDetails';
import TechnicalStack from './TechnicalStack';

const LogicFlowTab = () => {
  return (
    <div className="space-y-6">
      <FlowDiagram />
      <FlowStepDetails />
      <TechnicalStack />
    </div>
  );
};

export default LogicFlowTab;
