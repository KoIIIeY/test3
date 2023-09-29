import { Atom } from "@bryntum/chronograph/src/chrono2/atom/Atom.js"
import { CalculationModeSync } from "@bryntum/chronograph/src/chrono2/CalculationMode.js"
import { EffectHandler, HasProposedValue, PreviousValueOf, ProposedArgumentsOf, ProposedOrPrevious } from "@bryntum/chronograph/src/chrono2/Effect.js"
import { Base } from "@bryntum/chronograph/src/class/Base.js"
import {
    Formula,
    CycleDescription,
    CycleResolution,
    FormulaId,
    CalculateProposed,
    CycleResolutionInput, Variable
} from "@bryntum/chronograph/src/cycle_resolver/CycleResolver.js";
import { calculate, calculate_etalon, Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"


const StartVar           = Symbol('Start')
const EndVar             = Symbol('End')
const DurationVar        = Symbol('Duration')

//---------------------------------------------------------------------------------------------------------------------
const startFormula       = Formula.new({
    output      : StartVar,
    inputs      : new Set([ DurationVar, EndVar ])
})

const endFormula         = Formula.new({
    output      : EndVar,
    inputs      : new Set([ DurationVar, StartVar ])
})

const durationFormula   = Formula.new({
    output      : DurationVar,
    inputs      : new Set([ StartVar, EndVar ])
})

//---------------------------------------------------------------------------------------------------------------------
const cycleDescription = CycleDescription.new({
    variables           : new Set([ StartVar, EndVar, DurationVar ]),
    formulas            : new Set([ startFormula, endFormula, durationFormula ])
})


const cycleResolution = CycleResolution.new({
    description                 : cycleDescription,
    defaultResolutionFormulas   : new Set([ endFormula ])
})

//---------------------------------------------------------------------------------------------------------------------
enum Instruction {
    KeepDuration    = 'KeepDuration',
    KeepStart       = 'KeepStart',
    KeepEnd         = 'KeepEnd'
}


//---------------------------------------------------------------------------------------------------------------------
class CycleDispatcher extends CycleResolutionInput {

    addInstruction (instruction : Instruction) {
        if (instruction === Instruction.KeepStart) this.addKeepIfPossibleFlag(StartVar)
        if (instruction === Instruction.KeepEnd) this.addKeepIfPossibleFlag(EndVar)
        if (instruction === Instruction.KeepDuration) this.addKeepIfPossibleFlag(DurationVar)
    }


    collectInfo (Y : EffectHandler<CalculationModeSync>, atom : Atom, variable : Variable) {
        if (Y(PreviousValueOf(atom)) != null) this.addPreviousValueFlag(variable)

        if (Y(HasProposedValue(atom))) this.addProposedValueFlag(variable)
    }
}

const isNotNumber = (value : any) : boolean => value !== Number(value)

const dispatcherEq     = (v1 : CycleDispatcher, v2 : CycleDispatcher) : boolean => {
    const resolution1       = v1.resolution
    const resolution2       = v2.resolution

    return resolution1.get(StartVar) === resolution2.get(StartVar)
        && resolution1.get(EndVar) === resolution2.get(EndVar)
        && resolution1.get(DurationVar) === resolution2.get(DurationVar)
}

const defaultDispatcher = CycleDispatcher.new({ context : cycleResolution })

defaultDispatcher.addPreviousValueFlag(StartVar)
defaultDispatcher.addPreviousValueFlag(EndVar)
defaultDispatcher.addPreviousValueFlag(DurationVar)

class Task extends Entity.mix(Base) {

    @field()
    id: number

    @field({ lazy : false })
    start       : number

    @field({ lazy : false })
    end         : number

    @field({ lazy : false })
    duration    : number

    @field({ lazy : false, equality : dispatcherEq })
    dispatcher  : CycleDispatcher


    setStart        : (value : number, instruction : Instruction) => any
    setEnd          : (value : number, instruction : Instruction) => any
    setDuration     : (value : number, instruction : Instruction) => any


    @calculate('start')
    calculateStart (Y) : number {
        const dispatch : CycleDispatcher = this.dispatcher

        const instruction : FormulaId = dispatch.resolution.get(StartVar)

        if (instruction === startFormula.formulaId) {
            const endValue : number         = this.end
            const durationValue : number    = this.duration

            if (isNotNumber(endValue) || isNotNumber(durationValue)) return null

            return endValue - durationValue
        }
        else if (instruction === CalculateProposed) {
            return Y(ProposedOrPrevious)
        }
    }


    @calculate('end')
    calculateEnd (Y) : number {
        const dispatch : CycleDispatcher = this.dispatcher

        const instruction : FormulaId = dispatch.resolution.get(EndVar)

        if (instruction === endFormula.formulaId) {
            const startValue : number       = this.start
            const durationValue : number    = this.duration

            if (isNotNumber(startValue) || isNotNumber(durationValue)) return null

            return startValue + durationValue
        }
        else if (instruction === CalculateProposed) {
            return Y(ProposedOrPrevious)
        }
    }


    @calculate('duration')
    calculateDuration (Y) : number {
        const dispatch : CycleDispatcher = this.dispatcher

        const instruction : FormulaId = dispatch.resolution.get(DurationVar)

        if (instruction === durationFormula.formulaId) {
            const startValue : number       = this.start
            const endValue : number         = this.end

            if (isNotNumber(startValue) || isNotNumber(endValue)) return null

            return endValue - startValue
        }
        else if (instruction === CalculateProposed) {
            return Y(ProposedOrPrevious)
        }
    }


    @calculate_etalon('dispatcher')
    buildProposedDispatcher () : CycleDispatcher {
        return defaultDispatcher
    }


    @calculate('dispatcher')
    calculateDispatcher (Y : EffectHandler<CalculationModeSync>) : CycleDispatcher {
        const cycleDispatcher           = CycleDispatcher.new({ context : cycleResolution })

        cycleDispatcher.collectInfo(Y, this.$.start, StartVar)
        cycleDispatcher.collectInfo(Y, this.$.end, EndVar)
        cycleDispatcher.collectInfo(Y, this.$.duration, DurationVar)

        //---------------
        const startProposedArgs         = Y(ProposedArgumentsOf(this.$.start))

        const startInstruction : Instruction = startProposedArgs ? startProposedArgs[ 0 ] : undefined

        if (startInstruction) cycleDispatcher.addInstruction(startInstruction)

        //---------------
        const endProposedArgs         = Y(ProposedArgumentsOf(this.$.end))

        const endInstruction : Instruction = endProposedArgs ? endProposedArgs[ 0 ] : undefined

        if (endInstruction) cycleDispatcher.addInstruction(endInstruction)

        //---------------
        const durationProposedArgs    = Y(ProposedArgumentsOf(this.$.duration))

        const durationInstruction : Instruction = durationProposedArgs ? durationProposedArgs[ 0 ] : undefined

        if (durationInstruction) cycleDispatcher.addInstruction(durationInstruction)

        return cycleDispatcher
    }
}


export default Task;

