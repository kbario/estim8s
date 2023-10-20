import { Accessor, createRenderEffect, Setter, Signal } from "solid-js";

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

type InputProps<T> = { sig: Accessor<T>, setSig: Setter<T>, placeholder?: string, type?: HTMLAttributes<HTMLInputElement>, autocomplete?: "email" | string }

export default function Input<T>(props: InputProps<T>) {
  return <input use:model={[props.sig, props.setSig]} type={props?.type} placeholder={props?.placeholder} autocomplete={props.autocomplete} class="input text-white input-bordered w-full max-w-xs" />

}
