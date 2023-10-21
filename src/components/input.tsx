import { Accessor, createRenderEffect, Setter, Signal } from "solid-js";

function sigModel(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

type SigInputProps<T> = { sig: Accessor<T>, setSig: Setter<T>, placeholder?: string, type?: HTMLAttributes<HTMLInputElement>, autocomplete?: "email" | string }

export function SigInput<T>(props: SigInputProps<T>) {
  return <input use:sigModel={[props.sig, props.setSig]} type={props?.type} placeholder={props?.placeholder} autocomplete={props.autocomplete} class="input text-white input-bordered w-full max-w-xs" />
}

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field));
  el.addEventListener("input", (e) => setField(e.target.value));
}

type InputProps<T> = { sig: T, setSig: (v: T) => void, placeholder?: string, type?: HTMLAttributes<HTMLInputElement>, autocomplete?: "email" | string }

export function Input<T>(props: InputProps<T>) {
  return <input use:model={[props.sig, props.setSig]} type={props?.type} placeholder={props?.placeholder} autocomplete={props.autocomplete} class="input text-white input-bordered w-full max-w-xs" />
}

