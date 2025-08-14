"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, MapPin, Filter, Plus, Trash2 } from "lucide-react";
import { BOUNDARY_OBJECT } from "@/lib/nigerian-local-government-administrative-boundaries";
import { VehicleFee, createLGAsBulk } from "@/actions/lga";
import { NIGERIAN_STATES } from "@/lib/const";
import { toast } from "sonner";

// Nigerian states mapping

// Types for the boundary data
interface NigeriaLGAFeature {
  type: "Feature";
  id: string;
  properties: {
    id: number;
    name: string;
    code: string;
    timestamp: string;
    state_code: string;
  };
  geometry: {
    type: "MultiPolygon" | "Polygon";
    coordinates: number[][][];
  };
}

interface LGAImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LGAImportModal({
  isOpen,
  onClose,
  onSuccess,
}: LGAImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLGAs, setSelectedLGAs] = useState<NigeriaLGAFeature[]>([]);
  const [defaultFees, setDefaultFees] = useState<VehicleFee[]>([
    { vehicleCategory: "TRICYCLE", fee: 300 },
    { vehicleCategory: "MOTOR_CYCLE", fee: 150 },
    { vehicleCategory: "TAXI", fee: 400 },
    { vehicleCategory: "BUS", fee: 800 },
  ]);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mockLGAs] = useState<NigeriaLGAFeature[]>(
    // @ts-expect-error: kdmmdksjdm
    BOUNDARY_OBJECT.features as NigeriaLGAFeature[]
  );

  const filteredLGAs = mockLGAs.filter((lga) => {
    const matchesState =
      stateFilter === "all" || lga.properties.state_code === stateFilter;
    const matchesSearch =
      searchTerm === "" ||
      lga.properties.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesState && matchesSearch;
  });

  const handleLGAToggle = (lga: NigeriaLGAFeature, checked: boolean) => {
    if (checked) {
      setSelectedLGAs([...selectedLGAs, lga]);
    } else {
      setSelectedLGAs(
        selectedLGAs.filter(
          (selected) => selected.properties.id !== lga.properties.id
        )
      );
    }
  };

  const handleSelectAll = () => {
    setSelectedLGAs(filteredLGAs);
  };

  const handleDeselectAll = () => {
    setSelectedLGAs([]);
  };

  const handleFeeChange = (
    index: number,
    field: keyof VehicleFee,
    value: string | number
  ) => {
    const updatedFees = [...defaultFees];
    if (field === "fee") {
      updatedFees[index][field] = Number(value);
    } else {
      updatedFees[index][field] = String(value);
    }
    setDefaultFees(updatedFees);
  };

  const addFeeCategory = () => {
    setDefaultFees([...defaultFees, { vehicleCategory: "", fee: 0 }]);
  };

  const removeFeeCategory = (index: number) => {
    setDefaultFees(defaultFees.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedLGAs.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Transform selected LGAs to match API format
      const lgasToCreate = selectedLGAs.map((lga) => ({
        name: lga.properties.name,
        fee: defaultFees.filter((fee) => fee.vehicleCategory && fee.fee > 0),
        boundary: {
          type:
            lga.geometry.type === "MultiPolygon"
              ? "Polygon"
              : lga.geometry.type,
          coordinates:
            lga.geometry.type === "MultiPolygon"
              ? lga.geometry.coordinates[0] // Take first polygon from MultiPolygon
              : lga.geometry.coordinates,
        },
      }));

      // @ts-expect-error: kdmmdksjdm
      const newLgas = await createLGAsBulk(lgasToCreate);

      if (!newLgas.success) {
        console.log({ newLgas });
        toast.error("Failed to import LGAs. Please try again.");
      }

      // Reset form
      setSelectedLGAs([]);
      setDefaultFees([
        { vehicleCategory: "TRICYCLE", fee: 300 },
        { vehicleCategory: "MOTOR_CYCLE", fee: 150 },
        { vehicleCategory: "TAXI", fee: 400 },
        { vehicleCategory: "BUS", fee: 800 },
      ]);
      setStateFilter("all");
      setSearchTerm("");

      onSuccess?.();
      onClose();
    } catch (error) {
      // TODO: show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const selectedByState = selectedLGAs.reduce((acc, lga) => {
    const stateCode = lga.properties.state_code;
    acc[stateCode] = (acc[stateCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import LGAs from Official Data
          </DialogTitle>
          <DialogDescription>
            Select Local Government Areas from the official Nigerian
            administrative boundaries dataset and configure default fees.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Left Column - Filters and Settings */}
          <ScrollArea className="grid">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>State Filter</Label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {Object.entries(NIGERIAN_STATES).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name} ({code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search LGAs</Label>
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex-1"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Default Fees Configuration */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Default Vehicle Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {defaultFees.map((fee, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Vehicle Category</Label>
                      {defaultFees.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeCategory(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="e.g., TRICYCLE"
                      value={fee.vehicleCategory}
                      onChange={(e) =>
                        handleFeeChange(
                          index,
                          "vehicleCategory",
                          e.target.value
                        )
                      }
                      className="text-sm"
                    />
                    <div>
                      <Label className="text-xs">Fee (₦)</Label>
                      <Input
                        type="number"
                        value={fee.fee}
                        onChange={(e) =>
                          handleFeeChange(index, "fee", e.target.value)
                        }
                        min="0"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFeeCategory}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Selection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Selected:</span>
                    <Badge variant="default">{selectedLGAs.length}</Badge>
                  </div>
                  {Object.entries(selectedByState).map(([stateCode, count]) => (
                    <div
                      key={stateCode}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-muted-foreground">
                        {NIGERIAN_STATES[stateCode]}:
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {String(count)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollArea>

          {/* Middle Column - LGA List */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Available LGAs ({filteredLGAs.length})
                  </span>
                  <Badge variant="outline">
                    {selectedLGAs.length} selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 p-4">
                    {filteredLGAs.map((lga) => {
                      const isSelected = selectedLGAs.some(
                        (selected) =>
                          selected.properties.id === lga.properties.id
                      );
                      return (
                        <div
                          key={lga.properties.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleLGAToggle(lga, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {lga.properties.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {lga.properties.code}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {NIGERIAN_STATES[lga.properties.state_code]} (
                              {lga.properties.state_code})
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              selectedLGAs.length === 0 ||
              defaultFees.every((fee) => !fee.vehicleCategory || fee.fee <= 0)
            }
          >
            {isLoading ? "Importing..." : `Import ${selectedLGAs.length} LGAs`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
