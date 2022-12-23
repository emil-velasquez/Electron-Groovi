//followed this guide: https://dev.to/sandra_lewis/building-a-multi-range-slider-in-react-from-scratch-4dl1

import "../../styles/utility/MultiRangeSliderStyle.css"

import { useState, useRef, useCallback, useEffect } from "react";

type MultiRangeSliderProps = {
    min: number,
    max: number,
    onChange: (newMin: number, newMax: number) => void,
    minVal: number,
    maxVal: number
}

function MultiRangeSlider(props: MultiRangeSliderProps) {
    const [minVal, setMinVal] = useState(props.min);
    const [maxVal, setMaxVal] = useState(props.max);

    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMinVal(props.min);
        setMaxVal(props.max);
    }, [props.min, props.max])

    useEffect(() => {
        setMinVal(props.minVal);
        setMaxVal(props.maxVal);
    }, [props.minVal, props.maxVal])

    const getPercent = useCallback((value: number) => {
        return (value - props.min) / (props.max - props.min) * 100
    }, [props.min, props.max]);

    useEffect(() => {
        if (maxValRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(+maxValRef.current.value);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`
                setRangeOffset(minPercent, maxPercent)
            }
        }
    }, [minVal, getPercent])

    useEffect(() => {
        if (minValRef.current) {
            const minPercent = getPercent(+minValRef.current.value);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
                setRangeOffset(minPercent, maxPercent);
            }
        }
    }, [maxVal, getPercent])

    const setRangeOffset = (minPercent: number, maxPercent: number) => {
        if (range.current) {
            if (minPercent > 85) {
                range.current.style.left = `${minPercent - 1.25}%`;
            } else if (maxPercent < 15) {
                range.current.style.left = `${minPercent + 1.25}%`;
            } else {
                range.current.style.left = `${minPercent}%`;
            }
        }
    }

    useEffect(() => {
        props.onChange(minVal, maxVal);
    }, [minVal, maxVal])

    return (
        <div className="multi-slider-container">
            <input type="range" min={props.min} max={props.max} value={minVal} ref={minValRef} step="0.1"
                onChange={(event) => {
                    const value = Math.min(+event.target.value, maxVal - 1);
                    setMinVal(value);
                    event.target.value = value.toString();
                }}
                className={"thumb thumb-zindex-3" + (minVal > props.max - 25 ? " thumb-zidnex-5" : "")} />
            <input type="range" min={props.min} max={props.max} value={maxVal} step="0.1"
                onChange={(event) => {
                    const value = Math.max(+event.target.value, minVal + 1);
                    setMaxVal(value);
                    event.target.value = value.toString();
                }}
                ref={maxValRef} className="thumb thumb-zindex-4" />

            <div className="slider">
                <div className="slider-track" />
                <div ref={range} className="slider-range" />
            </div>
        </div>
    )
}

export default MultiRangeSlider;