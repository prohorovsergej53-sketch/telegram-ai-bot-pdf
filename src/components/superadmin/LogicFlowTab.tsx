import FlowDiagram from './FlowDiagram';
import FlowStepDetails from './FlowStepDetails';
import DataFlowDiagram from './DataFlowDiagram';
import TechnicalStack from './TechnicalStack';
import TariffPaymentLogic from './TariffPaymentLogic';

const LogicFlowTab = () => {
  return (
    <div className="space-y-6">
      <TariffPaymentLogic />
      <FlowDiagram />
      <FlowStepDetails />
      <DataFlowDiagram />
      <TechnicalStack />
    </div>
  );
};

export default LogicFlowTab;