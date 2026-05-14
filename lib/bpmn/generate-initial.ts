export interface UseCaseForBpmn {
  id: string;
  title: string;
  processSteps: unknown;
  assignedTo: string | null;
  technicalOwner: string | null;
  consultantId: string | null;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateInitialBpmn(useCase: UseCaseForBpmn): string {
  const steps = Array.isArray(useCase.processSteps)
    ? (useCase.processSteps as string[])
    : [];

  const actors = [
    useCase.assignedTo     ? { id: "lane_metier",  name: "Responsable Métier" } : null,
    useCase.technicalOwner ? { id: "lane_dsi",     name: "DSI / IT" }           : null,
    useCase.consultantId   ? { id: "lane_consult", name: "Consultant IA" }      : null,
  ].filter(Boolean) as { id: string; name: string }[];

  const tasksXml = steps
    .map((s, i) => `    <bpmn:task id="Task_${i}" name="${escapeXml(s)}"/>`)
    .join("\n");

  const lanesXml =
    actors.length > 0
      ? `    <bpmn:laneSet id="LaneSet_1">${actors
          .map((a) => `<bpmn:lane id="${a.id}" name="${escapeXml(a.name)}"/>`)
          .join("")}</bpmn:laneSet>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_${useCase.id}"
  targetNamespace="http://movetoai.io/bpmn">
  <bpmn:collaboration id="Collab_1">
    <bpmn:participant id="Participant_1" name="${escapeXml(useCase.title)}" processRef="Process_1"/>
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
${lanesXml}
    <bpmn:startEvent id="Start" name="Déclencheur"/>
${tasksXml}
    <bpmn:endEvent id="End" name="Résultat"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collab_1"/>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}
