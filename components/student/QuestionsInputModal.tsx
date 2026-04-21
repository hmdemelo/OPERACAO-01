'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface QuestionsInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (correct: number, total: number, actualMinutes: number) => void;
    itemContent: string;
    recommendedMinutes?: number | null;
}

export function QuestionsInputModal({ isOpen, onClose, onSave, itemContent, recommendedMinutes }: QuestionsInputModalProps) {
    const [correctCount, setCorrectCount] = useState<string>('');
    const [totalQuestions, setTotalQuestions] = useState<string>('');
    const [actualMinutes, setActualMinutes] = useState<string>(
        recommendedMinutes ? String(recommendedMinutes) : ''
    );
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const correct = correctCount === '' ? 0 : parseInt(correctCount);
        const total = totalQuestions === '' ? 0 : parseInt(totalQuestions);
        const minutes = actualMinutes === '' ? (recommendedMinutes ?? 0) : parseInt(actualMinutes);

        if (isNaN(correct) || isNaN(total) || isNaN(minutes)) {
            setError('Por favor, insira números válidos.');
            return;
        }
        if (correct < 0 || total < 0 || minutes < 0) {
            setError('Os valores devem ser positivos.');
            return;
        }
        if (correct > total && total > 0) {
            setError('O número de acertos não pode ser maior que o total de questões.');
            return;
        }

        setError(null);
        onSave(correct, total, minutes);
        onClose();
        setCorrectCount('');
        setTotalQuestions('');
        setActualMinutes(recommendedMinutes ? String(recommendedMinutes) : '');
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError(null);
            setCorrectCount('');
            setTotalQuestions('');
            setActualMinutes(recommendedMinutes ? String(recommendedMinutes) : '');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Concluir bloco</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-foreground">{itemContent}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Tempo dedicado */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="minutes" className="text-right leading-tight">
                            Tempo dedicado
                        </Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input
                                id="minutes"
                                type="number"
                                min={0}
                                value={actualMinutes}
                                onChange={(e) => setActualMinutes(e.target.value)}
                                placeholder={recommendedMinutes ? String(recommendedMinutes) : '0'}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">min</span>
                            {recommendedMinutes && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    recomendado: {recommendedMinutes}min
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-3 space-y-3">
                        <p className="text-xs text-muted-foreground">Questões (opcional)</p>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total" className="text-right">Total</Label>
                            <Input
                                id="total"
                                type="number"
                                min={0}
                                value={totalQuestions}
                                onChange={(e) => setTotalQuestions(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: 20"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="correct" className="text-right">Acertos</Label>
                            <Input
                                id="correct"
                                type="number"
                                min={0}
                                value={correctCount}
                                onChange={(e) => setCorrectCount(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: 15"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar e Concluir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
