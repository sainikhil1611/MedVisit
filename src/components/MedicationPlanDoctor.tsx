import { useState } from "react";
import { Medication, mockMedications } from "@/lib/mockData";
import { Pill, CheckCircle2, Trash2, Plus, Edit3, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface MedicationPlanDoctorProps {
  onPublish: () => void;
  published: boolean;
}

const confidenceColor = (score: number) => {
  if (score >= 0.85) return "bg-success/10 text-success border-success/20";
  if (score >= 0.7) return "bg-warning/10 text-warning border-warning/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
};

const MedicationPlanDoctor = ({ onPublish, published }: MedicationPlanDoctorProps) => {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState<Partial<Medication>>({ name: "", dosage: "", frequency: "", duration: "", notes: "" });

  const toggleApproval = (id: string) => {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, approved: !m.approved } : m)));
  };

  const removeMed = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const saveMedEdit = () => {
    if (!editingMed) return;
    setMedications((prev) => prev.map((m) => (m.id === editingMed.id ? editingMed : m)));
    setEditingMed(null);
  };

  const addMedication = () => {
    const med: Medication = {
      id: Date.now().toString(),
      name: newMed.name || "",
      dosage: newMed.dosage || "",
      frequency: newMed.frequency || "",
      duration: newMed.duration || "",
      notes: newMed.notes || "",
      confidence: 1,
      approved: true,
    };
    setMedications((prev) => [...prev, med]);
    setNewMed({ name: "", dosage: "", frequency: "", duration: "", notes: "" });
    setShowAdd(false);
  };

  const allApproved = medications.length > 0 && medications.every((m) => m.approved);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Pill className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Medication Plan</h3>
            <p className="text-xs text-muted-foreground">Review and approve before sharing with patient</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <div className="divide-y divide-border">
        {medications.map((med) => (
          <div key={med.id} className={`flex items-start gap-4 px-6 py-4 transition-colors ${med.approved ? "bg-success/[0.02]" : ""}`}>
            <button
              onClick={() => toggleApproval(med.id)}
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                med.approved ? "border-success bg-success text-success-foreground" : "border-border hover:border-primary"
              }`}
            >
              {med.approved && <CheckCircle2 className="h-4 w-4" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{med.name}</span>
                <span className="text-sm text-muted-foreground">{med.dosage}</span>
                <Badge variant="outline" className={`text-[10px] ${confidenceColor(med.confidence)}`}>
                  {Math.round(med.confidence * 100)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {med.frequency} · {med.duration}
              </p>
              {med.notes && <p className="mt-1 text-xs text-muted-foreground italic">{med.notes}</p>}
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingMed({ ...med })}>
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeMed(med.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-muted/30 px-6 py-4">
        {published ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Medication plan shared with patient
          </div>
        ) : !allApproved ? (
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertTriangle className="h-4 w-4" />
            Approve all medications before sharing with patient
          </div>
        ) : (
          <Button onClick={onPublish}>
            <Send className="mr-2 h-4 w-4" />
            Share with Patient
          </Button>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMed} onOpenChange={() => setEditingMed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          {editingMed && (
            <div className="space-y-3">
              <Input value={editingMed.name} onChange={(e) => setEditingMed({ ...editingMed, name: e.target.value })} placeholder="Medication name" />
              <Input value={editingMed.dosage} onChange={(e) => setEditingMed({ ...editingMed, dosage: e.target.value })} placeholder="Dosage" />
              <Input value={editingMed.frequency} onChange={(e) => setEditingMed({ ...editingMed, frequency: e.target.value })} placeholder="Frequency" />
              <Input value={editingMed.duration} onChange={(e) => setEditingMed({ ...editingMed, duration: e.target.value })} placeholder="Duration" />
              <Input value={editingMed.notes} onChange={(e) => setEditingMed({ ...editingMed, notes: e.target.value })} placeholder="Notes" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMed(null)}>Cancel</Button>
            <Button onClick={saveMedEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} placeholder="Medication name" />
            <Input value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} placeholder="Dosage" />
            <Input value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} placeholder="Frequency" />
            <Input value={newMed.duration} onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })} placeholder="Duration" />
            <Input value={newMed.notes} onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })} placeholder="Notes" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={addMedication}>Add Medication</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicationPlanDoctor;
